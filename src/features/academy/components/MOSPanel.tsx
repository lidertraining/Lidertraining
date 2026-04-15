import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';

const PHASES = [
  { t: '6h', title: 'Follow-up', desc: 'Agrade\u00e7a, confirme interesse', icon: 'chat' },
  { t: '12h', title: 'Apresenta\u00e7\u00e3o', desc: 'Mostre o plano completo', icon: 'co_present' },
  { t: '24h', title: 'Fechamento', desc: 'Convide para a decis\u00e3o', icon: 'handshake' },
];

export function MOSPanel() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">
        MOS \u2014 M\u00e9todo de Opera\u00e7\u00e3o
      </h2>
      <div className="flex flex-col gap-2">
        {PHASES.map((p) => (
          <Card key={p.t} variant="surface-sm" className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gp">
              <span className="serif text-sm font-bold text-white">{p.t}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon name={p.icon} className="!text-[16px] text-am" />
                <div className="text-sm font-semibold">{p.title}</div>
              </div>
              <div className="text-[11px] text-on-3">{p.desc}</div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
