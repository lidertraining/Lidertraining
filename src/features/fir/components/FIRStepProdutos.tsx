import { useState } from 'react';
import type { FIRDados } from '../firTypes';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Input } from '@shared/ui/Input';
import { cn } from '@lib/cn';

interface Props {
  dados: FIRDados;
  setDados: (d: FIRDados) => void;
}

const CHECKLIST = [
  'Entendi o catálogo de produtos',
  'Escolhi meu kit inicial',
  'Fiz meu primeiro pedido',
  'Preparei o "cantinho" pra quando chegar',
  'Anotei a data estimada de entrega',
];

export function FIRStepProdutos({ dados, setDados }: Props) {
  const [checked, setChecked] = useState<boolean[]>(Array(CHECKLIST.length).fill(false));

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const done = checked.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="serif text-xl font-bold">Seus produtos a caminho</h2>
        <p className="mt-1 text-sm text-on-2">
          Ser produto do produto é a regra nº 1. Quando seus produtos chegarem, você
          vai estar pronto(a) pra usar e recomendar com propriedade.
        </p>
      </div>

      {/* Data de chegada */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="local_shipping" filled className="!text-[18px] text-gd" />
          <div className="text-sm font-semibold">Data estimada de chegada</div>
        </div>
        <Input
          type="date"
          value={dados.dataChegada}
          onChange={(e) => setDados({ ...dados, dataChegada: e.target.value })}
        />
        {dados.dataChegada && (
          <Countdown target={dados.dataChegada} />
        )}
      </Card>

      {/* Checklist pré-chegada */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="checklist" filled className="!text-[18px] text-em" />
            <div className="text-sm font-semibold">Pré-chegada</div>
          </div>
          <span className="text-[10px] text-on-3">{done}/{CHECKLIST.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          {CHECKLIST.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className="tap flex items-center gap-3 text-left"
            >
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition',
                  checked[i] ? 'bg-em text-white' : 'border-2 border-sf-top text-transparent',
                )}
              >
                <Icon name="check" filled className="!text-[14px]" />
              </div>
              <span className={cn('text-sm', checked[i] && 'line-through opacity-60')}>
                {item}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Countdown({ target }: { target: string }) {
  const days = Math.max(
    0,
    Math.ceil((new Date(target).getTime() - Date.now()) / 86400000),
  );
  return (
    <div className="flex items-center gap-2 rounded-card bg-gd/10 px-3 py-2 text-center">
      <Icon name="timer" filled className="!text-[16px] text-gd" />
      <span className="text-sm text-on-2">
        {days === 0 ? (
          <span className="font-bold text-em">Chegam hoje! 🎉</span>
        ) : (
          <>
            Faltam <span className="serif font-bold text-gd">{days}</span> dia(s)
          </>
        )}
      </span>
    </div>
  );
}
