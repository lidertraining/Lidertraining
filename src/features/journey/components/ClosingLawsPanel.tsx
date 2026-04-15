import { useClosingLaws } from '../hooks/useJourneyContent';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';

export function ClosingLawsPanel() {
  const { data: laws = [] } = useClosingLaws();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="serif text-base font-bold">As 3 Leis do Fechamento</h3>
        <p className="text-xs text-on-3">
          Domine essas tr\u00eas e voc\u00ea fecha sem parecer vender.
        </p>
      </div>
      {laws.map((l, i) => (
        <Card
          key={i}
          variant="surface"
          className="flex flex-col gap-2 p-4"
          glow={i === 0 ? 'gd' : null}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gg">
              <Icon name={l.icon} filled className="!text-[20px] text-sf-void" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gd">
                Lei {i + 1}
              </div>
              <div className="serif text-base font-bold">{l.name}</div>
            </div>
          </div>
          <p className="text-sm text-on-2">{l.description}</p>
          <div className="rounded-card-sm bg-sf-hi p-3 text-xs italic text-on-3">
            \u201C{l.example}\u201D
          </div>
        </Card>
      ))}
    </div>
  );
}
