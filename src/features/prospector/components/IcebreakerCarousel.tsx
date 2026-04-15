import { useIcebreakers } from '@features/journey/hooks/useJourneyContent';
import { Card } from '@shared/ui/Card';
import { CopyButton } from '@features/journey/components/CopyButton';
import { Icon } from '@shared/ui/Icon';

export function IcebreakerCarousel() {
  const { data: items = [] } = useIcebreakers();

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon name="bolt" filled className="!text-[18px] text-or" />
        <h2 className="serif text-base font-bold">Quebra-gelos r\u00e1pidos</h2>
      </div>
      <div className="no-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {items.slice(0, 6).map((t, i) => (
          <Card
            key={i}
            variant="surface-sm"
            className="flex w-[260px] shrink-0 flex-col gap-2 p-3"
          >
            <p className="text-xs text-on-2">{t}</p>
            <CopyButton text={t} className="self-start" />
          </Card>
        ))}
      </div>
    </section>
  );
}
