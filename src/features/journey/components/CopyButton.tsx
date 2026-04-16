import { useState } from 'react';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';
import { useToast } from '@shared/hooks/useToast';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function CopyButton({ text, className, label = 'Copiar' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast('Copiado para a área de transferência', 'success', 'content_copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Não foi possível copiar', 'error');
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'tap flex items-center gap-1 rounded-chip bg-sf-hi px-3 py-1 text-[11px] font-semibold text-on-2 hover:text-am',
        className,
      )}
    >
      <Icon name={copied ? 'check' : 'content_copy'} className="!text-[14px]" />
      {copied ? 'Copiado!' : label}
    </button>
  );
}
