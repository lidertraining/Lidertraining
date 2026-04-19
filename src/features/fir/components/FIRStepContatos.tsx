import type { FIRDados } from '../firTypes';
import { SmartContactUploader } from '@/components/SmartContactUploader';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { useLeads } from '@features/prospector/hooks/useLeads';

interface Props {
  dados: FIRDados;
  setDados: (d: FIRDados) => void;
}

export function FIRStepContatos({ dados }: Props) {
  const { data: leads = [] } = useLeads();

  const total = leads.length + (dados.contatos?.length ?? 0);
  const meta = 50;
  const pct = Math.min(100, (total / meta) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="serif text-xl font-bold">Sua lista viva</h2>
        <p className="mt-1 text-sm text-on-2">
          O coração do negócio. Importe contatos do celular, adicione manualmente e classifique.
          Meta mínima: <strong className="text-am">{meta} nomes</strong>.
        </p>
      </div>

      {/* Progresso */}
      <Card variant="surface-sm" className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-on-3">Contatos na lista</span>
          <span className="font-semibold text-am">
            {total} / {meta}
          </span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-sf-top">
          <div
            className="h-full rounded-full bg-gp transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        {total >= meta ? (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-em">
            <Icon name="check_circle" filled className="!text-[14px]" />
            Meta atingida! Sua lista é ouro.
          </div>
        ) : (
          <div className="text-[10px] text-on-3">
            Faltam <strong>{meta - total}</strong> contatos pra atingir a meta.
          </div>
        )}
      </Card>

      {/* Importação inteligente multi-plataforma (Android nativo, wizard iPhone, DnD desktop) */}
      <SmartContactUploader
        context="fir"
        existingContacts={leads.map((l) => ({ name: l.name, phone: l.phone }))}
      />

      {/* Dicas de lista viva */}
      <Card variant="surface-sm" className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Icon name="tips_and_updates" filled className="!text-[18px] text-gd" />
          <div className="text-sm font-semibold">Dicas pra lista viva</div>
        </div>
        <ul className="flex flex-col gap-1.5 text-[11px] text-on-2">
          <li className="flex gap-2">
            <span className="text-am">•</span>
            <span>
              <strong>Não filtre antes de listar.</strong> Coloque todo mundo — depois você decide quem abordar.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-am">•</span>
            <span>
              Use o <strong>memory jogger</strong>: família, trabalho, escola, esporte, vizinhos, igreja, prestadores de serviço.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-am">•</span>
            <span>
              Pergunte <strong>"quem mais?"</strong> 5 vezes depois de achar que acabou.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-am">•</span>
            <span>
              Toda semana adicione <strong>2-3 nomes novos</strong>. Lista é organismo vivo.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
