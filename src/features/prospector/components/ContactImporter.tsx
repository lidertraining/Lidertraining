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
    const contacts = await pickVCFFile();
    await importContacts(contacts);
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

      <p className="text-[10px] text-on-3">
        Seus contatos são salvos apenas na sua conta. Ninguém mais tem acesso.
      </p>
    </Card>
  );
}
