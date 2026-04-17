import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface AudioPlayerProps {
  src: string;
  title: string;
  initialPosition?: number;
  onProgress?: (position: number, pct: number) => void;
  onComplete?: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SEEK_DELTA = 15;

export function AudioPlayer({
  src,
  title,
  initialPosition = 0,
  onProgress,
  onComplete,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const completeFired = useRef(false);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      if (initialPosition > 0 && initialPosition < audio.duration) {
        audio.currentTime = initialPosition;
      }
    });

    audio.addEventListener('timeupdate', () => {
      setCurrent(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [src, initialPosition]);

  // Save progress every 5 seconds
  useEffect(() => {
    if (!playing || duration === 0) return;
    const id = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const p = (audio.currentTime / duration) * 100;
      onProgress?.(audio.currentTime, p);
      if (p >= 95 && !completeFired.current) {
        completeFired.current = true;
        onComplete?.();
      }
    }, 5000);
    return () => clearInterval(id);
  }, [playing, duration, onProgress, onComplete]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  }, [playing]);

  const seek = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta));
  }, []);

  const cycleSpeed = useCallback(() => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next]!;
  }, [speedIdx]);

  const handleSeekBar = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const t = (Number(e.target.value) / 100) * duration;
      audio.currentTime = t;
      setCurrent(t);
    },
    [duration],
  );

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gp">
          <Icon name="headphones" filled className="!text-[24px] text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate serif text-base font-bold">{title}</div>
          <div className="text-[10px] text-on-3">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Waveform / progress bar */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={handleSeekBar}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-sf-top accent-am"
        />
        <div className="flex justify-between text-[9px] text-on-3">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => seek(-SEEK_DELTA)}
          className="tap flex h-10 w-10 items-center justify-center rounded-full bg-sf-top text-on-2"
          aria-label={`Voltar ${SEEK_DELTA}s`}
        >
          <Icon name="replay" className="!text-[20px]" />
          <span className="absolute text-[7px] font-bold">{SEEK_DELTA}</span>
        </button>

        <button
          onClick={togglePlay}
          className={cn(
            'tap flex h-14 w-14 items-center justify-center rounded-full',
            playing ? 'bg-am text-sf-void' : 'bg-gp text-white',
          )}
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
        >
          <Icon name={playing ? 'pause' : 'play_arrow'} filled className="!text-[28px]" />
        </button>

        <button
          onClick={() => seek(SEEK_DELTA)}
          className="tap flex h-10 w-10 items-center justify-center rounded-full bg-sf-top text-on-2"
          aria-label={`Avançar ${SEEK_DELTA}s`}
        >
          <Icon name="forward" className="!text-[20px]" />
          <span className="absolute text-[7px] font-bold">{SEEK_DELTA}</span>
        </button>
      </div>

      {/* Speed control */}
      <div className="flex justify-center">
        <button
          onClick={cycleSpeed}
          className="tap rounded-chip bg-sf-top px-4 py-1 text-[11px] font-bold text-am"
        >
          {SPEEDS[speedIdx]}x
        </button>
      </div>
    </Card>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
