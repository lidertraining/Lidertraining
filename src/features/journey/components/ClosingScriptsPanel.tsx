import { useClosingScripts } from '../hooks/useJourneyContent';
import { Card } from '@shared/ui/Card';
import { CopyButton } from './CopyButton';

export function ClosingScriptsPanel() {
  const { data: scripts = [] } = useClosingScripts();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="serif text-base font-bold">Scripts de Fechamento</h3>
      {scripts.map((s, i) => (
        <Card key={i} variant="surface-sm" className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-am">{s.name}</div>
            <CopyButton text={s.template} />
          </div>
          <p className="text-sm text-on-2">{s.template}</p>
        </Card>
      ))}
    </div>
  );
}
