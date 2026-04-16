import { Button } from '@shared/ui/Button';
import { Icon } from '@shared/ui/Icon';
import { useToast } from '@shared/hooks/useToast';
import { buildInviteURL, buildWhatsAppShareURL } from '../api/invites';

interface InviteShareButtonsProps {
  code: string;
  inviterName: string;
  compact?: boolean;
}

/**
 * Trio de botões para compartilhar convite: WhatsApp · Copiar link · Copiar código.
 */
export function InviteShareButtons({ code, inviterName, compact }: InviteShareButtonsProps) {
  const { toast } = useToast();
  const url = buildInviteURL(code);

  const openWhatsApp = () => {
    window.open(buildWhatsAppShareURL(code, inviterName), '_blank');
  };

  const copyURL = async () => {
    await navigator.clipboard.writeText(url);
    toast('Link copiado', 'success', 'content_copy');
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast(`Código ${code} copiado`, 'success', 'content_copy');
  };

  const size = compact ? 'sm' : 'md';

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ge"
        size={size}
        fullWidth
        onClick={openWhatsApp}
        leftIcon={<Icon name="chat" filled className="!text-[18px]" />}
      >
        Convidar via WhatsApp
      </Button>
      <div className="flex gap-2">
        <Button
          variant="surface"
          size={size}
          className="flex-1"
          onClick={copyURL}
          leftIcon={<Icon name="link" className="!text-[16px]" />}
        >
          Copiar link
        </Button>
        <Button
          variant="surface"
          size={size}
          className="flex-1"
          onClick={copyCode}
          leftIcon={<Icon name="content_copy" className="!text-[16px]" />}
        >
          Copiar código
        </Button>
      </div>
    </div>
  );
}
