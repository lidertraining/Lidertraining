import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { GOLDEN_RULES } from '@content/goldenRules';

export function GoldenRulesCard() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">4 Regras de Ouro</h2>
      <Card variant="surface" className="flex flex-col gap-2 p-5" glow="gd">
        {GOLDEN_RULES.map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gg">
              <span className="text-xs font-bold text-sf-void">{i + 1}</span>
            </div>
            <div className="flex-1 text-sm text-on">{r}</div>
            <Icon name="verified" filled className="!text-[16px] text-gd" />
          </div>
        ))}
      </Card>
    </section>
  );
}
