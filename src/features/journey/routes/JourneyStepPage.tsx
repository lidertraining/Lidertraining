import { useParams } from 'react-router-dom';
import { PagePlaceholder } from '@shared/ui/PagePlaceholder';

export function JourneyStepPage() {
  const { stepId } = useParams();
  return (
    <PagePlaceholder
      title={`Passo ${stepId ?? '?'}`}
      icon="route"
      description="Detalhe do passo com abas Aprender / Tarefas / Praticar / Agentes \u2014 Fase 2."
    />
  );
}
