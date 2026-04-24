import { useState } from 'react';
import { Icon } from '@shared/ui/Icon';
import { useToast } from '@shared/hooks/useToast';
import {
  hasContactPicker,
  pickContactsRich,
  pickVCFFile,
} from '../api/contactPicker';
import { useBulkCreateLeads } from '../hooks/useLeads';
import { cardsToContacts, type ParsedVCardRich } from '@lib/contacts-import';

export function ContactImporter() {
  const { toast } = useToast();
  const { mutateAsync: bulkCreate } = useBulkCreateLeads();
  const [importing, setImporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const supportsNative = hasContactPicker();

  const runImport = async (cards: ParsedVCardRich[], source: string) => {
    if (cards.length === 0) {
      toast('Nenhum contato encontrado', 'info');
      return;
    }
    const contacts = cardsToContacts(cards);
    if (contacts.length === 0) {
      toast('Nenhum contato com telefone', 'info');
      return;
    }
    setImporting(true);
    try {
      await bulkCreate({ contacts, source });
    } finally {
      setImporting(false);
    }
  };

  const handleNativePick = async () => {
    const results = await pickContactsRich();
    await runImport(results, 'Contatos do celular');
  };

  const handleVCF = async () => {
    const result = await pickVCFFile();
    if (!result.ok) {
      if (result.reason === 'no_file') return;
      if (result.reason === 'empty') {
        toast(
          'Não encontrei contatos nesse arquivo. Exporte de novo como .vcf.',
          'error',
        );
      } else {
        toast('Não consegui abrir esse arquivo. Tenta de novo.', 'error');
      }
      return;
    }
    await runImport(result.cards, 'Arquivo de contatos');
  };

  return (
    <div className="surface flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Icon name="contacts" filled className="!text-[20px] text-am" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Importar contatos</div>
          <div className="text-[11px] text-on-3">
            {importing ? 'Importando…' : 'Do celular ou arquivo .vcf'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {supportsNative ? (
          <button
            onClick={handleNativePick}
            disabled={importing}
            className="tap flex flex-col items-center gap-1 rounded-card-sm bg-sf-hi p-3 hover-glow disabled:opacity-60"
          >
            <Icon name="contact_phone" filled className="!text-[22px] text-am" />
            <span className="text-[11px] font-semibold text-on">Do celular</span>
            <span className="text-[10px] text-on-3">Nativo</span>
          </button>
        ) : (
          <button
            onClick={handleVCF}
            disabled={importing}
            className="tap flex flex-col items-center gap-1 rounded-card-sm bg-sf-hi p-3 hover-glow disabled:opacity-60"
          >
            <Icon name="upload_file" filled className="!text-[22px] text-am" />
            <span className="text-[11px] font-semibold text-on">Arquivo .vcf</span>
            <span className="text-[10px] text-on-3">iPhone/desktop</span>
          </button>
        )}

        <button
          onClick={handleVCF}
          disabled={importing}
          className="tap flex flex-col items-center gap-1 rounded-card-sm bg-sf-hi p-3 hover-glow disabled:opacity-60"
        >
          <Icon name="folder_open" filled className="!text-[22px] text-am" />
          <span className="text-[11px] font-semibold text-on">Arquivo .vcf</span>
          <span className="text-[10px] text-on-3">Qualquer origem</span>
        </button>
      </div>

      <button
        onClick={() => setShowHelp((v) => !v)}
        className="tap flex items-center justify-center gap-1 py-1 text-[11px] text-on-3 hover:text-on-2"
      >
        <Icon
          name="help_outline"
          className={`!text-[13px] transition-transform ${showHelp ? 'rotate-45' : ''}`}
        />
        Como exportar meus contatos?
      </button>

      {showHelp && (
        <div className="animate-fade-up rounded-card-sm bg-sf-c p-3 text-[11px] leading-relaxed text-on-2">
          <p className="mb-1 font-semibold text-on">iPhone:</p>
          <p className="mb-2">
            Contatos → selecione um contato → ⋯ → Compartilhar → Salvar em Arquivos. Pra todos:
            selecione &quot;Todos os contatos&quot; → Compartilhar → Exportar como .vcf
          </p>
          <p className="mb-1 font-semibold text-on">Android:</p>
          <p>Se você vê o botão &quot;Do celular&quot;, é só clicar — o Chrome abre o seletor nativo.</p>
        </div>
      )}
    </div>
  );
}
