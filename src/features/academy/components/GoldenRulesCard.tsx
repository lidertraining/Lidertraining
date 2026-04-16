import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { GOLDEN_RULES_DETAIL } from '@content/goldenRules';

export function GoldenRulesCard() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">4 Regras de Ouro</h2>
      <div className="flex flex-col gap-2">
        {GOLDEN_RULES_DETAIL.map((r, i) => (
          <Card key={i} variant="surface-sm" className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gg">
              <Icon name={r.icon} filled className="!text-[18px] text-sf-void" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gd">Regra {i + 1}</span>
                <span className="text-sm font-bold">{r.rule}</span>
              </div>
              <p className="mt-1 text-[12px] text-on-2">{r.explanation}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
