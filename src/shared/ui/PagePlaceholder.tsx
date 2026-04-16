import { EmptyState } from './EmptyState';

interface PagePlaceholderProps {
  title: string;
  icon: string;
  description?: string;
}

/**
 * Placeholder usado pelas páginas ainda não implementadas (Fase 1+).
 * Mantém layout consistênte até cada feature ser migrada.
 */
export function PagePlaceholder({ title, icon, description }: PagePlaceholderProps) {
  return (
    <div className="pt-4">
      <h1 className="serif mb-4 text-2xl font-bold">{title}</h1>
      <EmptyState
        icon={icon}
        title={`${title} em construção`}
        description={description ?? 'Esta tela será implementada em uma próxima fase da reestruturação.'}
      />
    </div>
  );
}
