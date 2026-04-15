import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { PRESENTATION_FORMATS } from '@content/presentationFormats';

const ICONS = ['person', 'videocam', 'play_circle', 'groups'];

export function PresentationFormatsCard() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">4 Formas de Apresentar</h2>
      <div className="grid grid-cols-2 gap-2">
        {PRESENTATION_FORMATS.map((f, i) => (
          <Card key={i} variant="surface-sm" className="flex flex-col gap-2 p-4">
            <Icon
              name={ICONS[i] ?? 'co_present'}
              filled
              className="!text-[22px] text-am"
            />
            <div className="text-sm font-semibold">{f}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
