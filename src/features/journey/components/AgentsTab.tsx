import { useState } from 'react';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { WHATSAPP_TEMPLATES } from '@content/whatsappTemplates';
import { OBJECTIONS } from '@content/objections';
import { useToast } from '@shared/hooks/useToast';
import { cn } from '@lib/cn';
import type { WhatsAppTemplate } from '@ltypes/content';

type Category = WhatsAppTemplate['category'];

const CATEGORIES: { id: Category | 'all' | 'objecoes'; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: 'apps' },
  { id: 'primeiro_contato', label: 'Primeiro contato', icon: 'waving_hand' },
  { id: 'convite', label: 'Convite', icon: 'mail' },
  { id: 'follow_up', label: 'Follow-up', icon: 'schedule' },
  { id: 'objecoes', label: 'Objeções', icon: 'psychology' },
  { id: 'fechamento', label: 'Fechamento', icon: 'handshake' },
  { id: 'pos_venda', label: 'Pós-venda', icon: 'celebration' },
];

export function AgentsTab() {
  const { toast } = useToast();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all');

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copiado`, 'success', 'content_copy');
    } catch {
      toast('Erro ao copiar', 'error');
    }
  };

  const filteredTemplates =
    category === 'all'
      ? WHATSAPP_TEMPLATES
      : category === 'objecoes'
        ? []
        : WHATSAPP_TEMPLATES.filter((t) => t.category === category);

  const showObjections = category === 'all' || category === 'objecoes';

  return (
    <div className="flex flex-col gap-4">
      <Card variant="surface" className="flex flex-col gap-2 p-4" glow="am">
        <div className="flex items-center gap-2">
          <Icon name="auto_stories" filled className="!text-[20px] text-am" />
          <div className="flex-1">
            <div className="serif text-base font-bold">Biblioteca de scripts</div>
            <div className="text-[11px] text-on-3">
              Templates testados em campo. Toque em "Copiar" e cole no WhatsApp.
            </div>
          </div>
        </div>
      </Card>

      {/* Chips de categoria */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn(
              'tap flex shrink-0 items-center gap-1.5 rounded-chip px-3 py-1.5 text-[11px] font-semibold transition',
              category === c.id
                ? 'bg-am text-sf-void'
                : 'bg-sf-top text-on-3 hover:text-on-2',
            )}
          >
            <Icon name={c.icon} className="!text-[14px]" />
            {c.label}
          </button>
        ))}
      </div>

      {/* Templates WhatsApp */}
      {filteredTemplates.length > 0 && (
        <div className="flex flex-col gap-2">
          {filteredTemplates.map((t) => (
            <Card key={t.id} variant="surface-sm" className="flex flex-col gap-2 p-4">
              <div className="flex items-start gap-2">
                <Icon name="chat" filled className="!text-[16px] text-em" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{t.title}</div>
                  {t.useWhen && (
                    <div className="mt-0.5 text-[10px] italic text-on-3">{t.useWhen}</div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="surface"
                  leftIcon={<Icon name="content_copy" className="!text-[12px]" />}
                  onClick={() => copy(t.template, t.title)}
                >
                  Copiar
                </Button>
              </div>
              <div className="rounded-card bg-sf-top/40 p-3 text-[12px] italic text-on-2">
                "{t.template}"
              </div>
              {t.variables && t.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="text-on-3">Vars:</span>
                  {t.variables.map((v) => (
                    <span key={v} className="rounded-chip bg-am/10 px-1.5 py-0.5 text-am">
                      [{v}]
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Objeções + respostas */}
      {showObjections && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon name="psychology" filled className="!text-[18px] text-gd" />
            <div className="serif text-base font-bold">Respostas a objeções</div>
          </div>
          {OBJECTIONS.map((obj, i) => (
            <Card key={i} variant="surface-sm" className="flex flex-col gap-2 p-4">
              <div className="flex items-start gap-2">
                <Icon name="help" filled className="mt-0.5 !text-[16px] text-gd" />
                <div className="flex-1 text-sm font-semibold">{obj.objection}</div>
                <Button
                  size="sm"
                  variant="surface"
                  leftIcon={<Icon name="content_copy" className="!text-[12px]" />}
                  onClick={() => copy(obj.response, 'Resposta')}
                >
                  Copiar
                </Button>
              </div>
              <div className="rounded-card bg-sf-top/40 p-3 text-[12px] italic text-on-2">
                "{obj.response}"
              </div>
              {obj.context && (
                <div className="text-[10px] text-on-3">
                  <span className="font-semibold">Quando aparece: </span>
                  {obj.context}
                </div>
              )}
              {obj.followUp && (
                <div className="text-[10px] text-am">
                  <span className="font-semibold">Devolva: </span>
                  "{obj.followUp}"
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
