import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStepNotes, saveStepNotes } from '../api/journey';
import { Textarea } from '@shared/ui/Textarea';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { useToast } from '@shared/hooks/useToast';

interface TasksTabProps {
  stepId: number;
}

export function TasksTab({ stepId }: TasksTabProps) {
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

  // Sincroniza valor inicial quando chega do server
  useEffect(() => {
    setValue(initial);
    lastSaved.current = initial;
  }, [initial]);

  // Autosave debounced
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
    <div className="flex flex-col gap-3">
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
