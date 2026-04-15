import { useIcebreakers } from '../hooks/useJourneyContent';
import { Card } from '@shared/ui/Card';
import { CopyButton } from './CopyButton';

export function IcebreakerList() {
  const { data: items = [] } = useIcebreakers();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="serif text-base font-bold">Quebra-gelos prontos</h3>
      <p className="text-xs text-on-3">
        Copie e adapte para o seu contato. A naturalidade \u00e9 o que vende.
      </p>
      <div className="flex flex-col gap-2">
        {items.map((t, i) => (
          <Card
            key={i}
            variant="surface-sm"
            className="flex items-start gap-3 p-3"
          >
            <div className="flex-1 text-sm text-on-2">{t}</div>
            <CopyButton text={t} />
          </Card>
        ))}
      </div>
    </div>
  );
}
