import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStepNotes, saveStepNotes } from '../api/journey';
import { Textarea } from '@shared/ui/Textarea';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { useToast } from '@shared/hooks/useToast';
import type { JourneyStep } from '@ltypes/content';

interface TasksTabProps {
  stepId: number;
  step?: JourneyStep;
}

/**
 * Persiste as tarefas marcadas em localStorage por (stepId, index).
 * É reset-ável: não é fonte de verdade, só ajuda o usuário a acompanhar visualmente.
 */
function useLocalChecklist(stepId: number, length: number) {
  const key = `lt_step_checklist_${stepId}`;
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw) as boolean[];
        if (Array.isArray(arr) && arr.length === length) return arr;
      }
    } catch {
      /* empty */
    }
    return Array(length).fill(false);
  });

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = prev.slice();
      next[i] = !next[i];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* empty */
      }
      return next;
    });
  };

  return { checked, toggle };
}

export function TasksTab({ stepId, step }: TasksTabProps) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: initial = '' } = useQuery({
    queryKey: ['step-notes', stepId],
    queryFn: () => getStepNotes(stepId),
  });
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const lastSaved = useRef<string>(initial);

  const tasks = step?.tasks ?? [];
  const { checked, toggle } = useLocalChecklist(stepId, tasks.length);
  const doneCount = checked.filter(Boolean).length;

  useEffect(() => {
    setValue(initial);
    lastSaved.current = initial;
  }, [initial]);

  useEffect(() => {
    if (value === lastSaved.current) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      setSaving(true);
      try {
        await saveStepNotes(stepId, value);
        lastSaved.current = value;
        setSavedAt(Date.now());
        qc.invalidateQueries({ queryKey: ['step-notes', stepId] });
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Erro ao salvar', 'error');
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [value, stepId, qc, toast]);

  return (
    <div className="flex flex-col gap-4">
      {/* Lista de tarefas prontas */}
      {tasks.length > 0 && (
        <Card variant="surface" className="flex flex-col gap-3 p-5" glow="em">
          <div className="flex items-center gap-2">
            <Icon name="checklist" filled className="!text-[20px] text-em" />
            <div className="flex-1 serif text-base font-bold">
              Sua checklist deste passo
            </div>
            <span className="rounded-chip bg-em/20 px-2 py-0.5 text-[10px] font-semibold text-em">
              {doneCount}/{tasks.length}
            </span>
          </div>
          <ol className="flex flex-col gap-3">
            {tasks.map((task, i) => {
              const isChecked = checked[i] ?? false;
              return (
                <li key={i} className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-label={`Marcar tarefa ${i + 1}`}
                    className={
                      'tap mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition ' +
                      (isChecked
                        ? 'bg-em text-white'
                        : 'border-2 border-sf-top bg-sf-void text-transparent')
                    }
                  >
                    <Icon name="check" filled className="!text-[16px]" />
                  </button>
                  <div className="flex-1">
                    <div
                      className={
                        'text-sm font-semibold text-on ' +
                        (isChecked ? 'line-through opacity-60' : '')
                      }
                    >
                      {i + 1}. {task.title}
                    </div>
                    {task.detail && (
                      <div className="mt-0.5 text-[11px] text-on-3">{task.detail}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-[10px] italic text-on-3">
            Checklist é apenas sua referência pessoal. A conclusão real do passo é via botão
            "Concluir passo" no rodapé.
          </p>
        </Card>
      )}

      {/* Caderno do passo */}
      <Card variant="surface" className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Icon name="edit_note" filled className="!text-[20px] text-am" />
          <div className="flex-1 serif text-base font-bold">Caderno do passo</div>
          <span className="text-[10px] text-on-3">
            {saving ? 'Salvando…' : savedAt ? 'Salvo' : ''}
          </span>
        </div>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Escreva aqui suas reflexões, listas e comprometimentos deste passo…"
          rows={8}
        />
        <p className="text-[11px] text-on-3">
          Salvamento automático. Volte a qualquer momento e continue.
        </p>
      </Card>
    </div>
  );
}
