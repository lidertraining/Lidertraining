import { EmptyState } from './EmptyState';

interface PagePlaceholderProps {
  title: string;
  icon: string;
  description?: string;
}

/**
 * Placeholder usado pelas p\u00e1ginas ainda n\u00e3o implementadas (Fase 1+).
 * Mant\u00e9m layout consist\u00eante at\u00e9 cada feature ser migrada.
 */
export function PagePlaceholder({ title, icon, description }: PagePlaceholderProps) {
  return (
    <div className="pt-4">
      <h1 className="serif mb-4 text-2xl font-bold">{title}</h1>
      <EmptyState
        icon={icon}
        title={`${title} em constru\u00e7\u00e3o`}
        description={description ?? 'Esta tela ser\u00e1 implementada em uma pr\u00f3xima fase da reestrutura\u00e7\u00e3o.'}
      />
    </div>
  );
}
