import { useState } from 'react';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { useToast } from '@shared/hooks/useToast';
import { useCreateLead } from '../hooks/useLeads';
import {
  hasContactPicker,
  pickContacts,
  pickVCFFile,
  type PickedContact,
} from '../api/contactPicker';

export function ContactImporter() {
  const { mutateAsync: createLead } = useCreateLead();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const supportsNative = hasContactPicker();

  const importContacts = async (contacts: PickedContact[]) => {
    if (contacts.length === 0) {
      toast('Nenhum contato selecionado', 'info');
      return;
    }

    setImporting(true);
    let imported = 0;

    for (const c of contacts) {
      try {
        await createLead({
          name: c.name,
          phone: c.phone ?? '',
          status: 'frio',
          source: 'Contatos do celular',
        });
        imported++;
      } catch {
        // Continua mesmo se um falhar (ex: duplicata)
      }
    }

    toast(`${imported} contato(s) importado(s)`, 'success', 'contacts');
    setImporting(false);
  };

  const handleNativePick = async () => {
    const contacts = await pickContacts();
    await importContacts(contacts);
  };

  const handleVCF = async () => {
    const result = await pickVCFFile();
    if (!result.ok) {
      if (result.reason === 'no_file') return; // usuário cancelou
      if (result.reason === 'wrong_type') {
        toast(
          'Arquivo não é um .vcf válido. Exporte os contatos pelo app Contatos primeiro.',
          'error',
        );
      } else if (result.reason === 'empty') {
        toast('O arquivo não tem contatos válidos', 'info');
      }
      return;
    }
    await importContacts(result.contacts);
  };

  return (
    <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Icon name="contacts" filled className="!text-[20px] text-am" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Importar contatos</div>
          <div className="text-[11px] text-on-3">
            {supportsNative
              ? 'Selecione direto do celular ou importe arquivo .vcf'
              : 'Importe seus contatos via arquivo .vcf'}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {supportsNative && (
          <Button
            variant="gp"
            size="sm"
            onClick={handleNativePick}
            disabled={importing}
            leftIcon={<Icon name="smartphone" className="!text-[16px]" />}
            className="flex-1"
          >
            {importing ? 'Importando…' : 'Do celular'}
          </Button>
        )}
        <Button
          variant="surface"
          size="sm"
          onClick={handleVCF}
          disabled={importing}
          leftIcon={<Icon name="upload_file" className="!text-[16px]" />}
          className="flex-1"
        >
          Arquivo .vcf
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setShowHelp((v) => !v)}
        className="tap flex items-center justify-between text-[11px] font-semibold text-am"
      >
        <span>Como exportar meus contatos</span>
        <Icon name={showHelp ? 'expand_less' : 'expand_more'} className="!text-[16px]" />
      </button>

      {showHelp && (
        <div className="flex flex-col gap-3 rounded-card bg-sf-top/40 p-3 text-[11px] leading-relaxed text-on-2">
          <div>
            <div className="mb-1 font-semibold text-am">iPhone</div>
            <ol className="list-decimal space-y-0.5 pl-4 text-on-3">
              <li>Abra o app <strong>Contatos</strong>.</li>
              <li>Toque em <strong>Listas</strong> → escolha a lista desejada.</li>
              <li>Toque em <strong>Exportar</strong> → <strong>Salvar em Arquivos</strong>.</li>
              <li>Volte aqui, toque em <strong>Arquivo .vcf</strong> e escolha o arquivo.</li>
            </ol>
          </div>
          <div>
            <div className="mb-1 font-semibold text-am">Android</div>
            <ol className="list-decimal space-y-0.5 pl-4 text-on-3">
              <li>Abra <strong>Contatos</strong> (Google).</li>
              <li>Menu → <strong>Selecionar</strong> → marque contatos.</li>
              <li>Menu → <strong>Compartilhar</strong> → <strong>Salvar no Drive/Arquivos</strong>.</li>
              <li>Volte aqui, toque em <strong>Arquivo .vcf</strong> e escolha o arquivo.</li>
            </ol>
          </div>
          <div className="text-[10px] text-on-3">
            O botão abre o gerenciador de arquivos do seu celular. Navegue até onde
            você salvou o .vcf (normalmente <strong>Arquivos</strong>, <strong>Downloads</strong> ou <strong>Drive</strong>) e selecione.
          </div>
        </div>
      )}

      <p className="text-[10px] text-on-3">
        Seus contatos são salvos apenas na sua conta. Ninguém mais tem acesso.
      </p>
    </Card>
  );
}
