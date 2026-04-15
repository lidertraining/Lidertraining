import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';

export function PromotionZones() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card variant="surface-sm" className="flex items-center gap-2 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-em/20">
          <Icon name="arrow_upward" filled className="!text-[16px] text-em" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold">Top 5 sobem</div>
          <div className="text-[10px] text-on-3">Pr\u00f3xima liga</div>
        </div>
      </Card>
      <Card variant="surface-sm" className="flex items-center gap-2 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rb/20">
          <Icon name="arrow_downward" filled className="!text-[16px] text-rb" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold">\u00daltimos 3 descem</div>
          <div className="text-[10px] text-on-3">Liga anterior</div>
        </div>
      </Card>
    </div>
  );
}
