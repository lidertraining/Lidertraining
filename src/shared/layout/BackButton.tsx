import { useNavigate } from 'react-router-dom';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({ to, label = 'Voltar', className }: BackButtonProps) {
  const navigate = useNavigate();

  const onClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn('tap flex items-center gap-1 text-sm font-semibold text-on-2', className)}
    >
      <Icon name="arrow_back" className="!text-[18px]" />
      <span>{label}</span>
    </button>
  );
}
