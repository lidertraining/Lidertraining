import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { PRESENTATION_FORMATS_DETAIL } from '@content/presentationFormats';

export function PresentationFormatsCard() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">4 Formas de Apresentar</h2>
      <div className="flex flex-col gap-2">
        {PRESENTATION_FORMATS_DETAIL.map((f, i) => (
          <Card key={i} variant="surface-sm" className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gp/20">
                <Icon name={f.icon} filled className="!text-[18px] text-am" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{f.format}</div>
                <div className="text-[10px] text-on-3">~ {f.durationMinutes} min</div>
              </div>
            </div>
            <p className="text-[12px] text-on-2">{f.description}</p>
            <div className="rounded-card bg-sf-top/40 px-3 py-2 text-[11px] text-on-3">
              <span className="font-semibold text-am">Quando usar: </span>
              {f.useWhen}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
