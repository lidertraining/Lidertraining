import type { PresentationFormat } from '@ltypes/content';

/**
 * 4 formatos de apresentar a oportunidade — cada um com contexto de uso,
 * duração ideal e descrição. Aparece na Academia.
 */
export const PRESENTATION_FORMATS_DETAIL: PresentationFormat[] = [
  {
    format: 'Presencial — 1 a 1',
    description:
      'Você e o lead frente a frente, com papel, caneta e café. Maior conversão (até 50%) porque gera conexão humana e permite leitura de linguagem corporal.',
    useWhen: 'Lead quente, estratégico, potencial líder. Ou pra leads que moram na mesma cidade e merecem o investimento de tempo.',
    durationMinutes: 60,
    icon: 'handshake',
  },
  {
    format: 'Online — vídeo chamada',
    description:
      'Zoom, Meet ou WhatsApp com vídeo. Taxa de conversão em torno de 30%, mas escala absurda — você faz 5 por semana sem sair de casa. É o padrão moderno.',
    useWhen: 'Maioria dos leads. Agende 40 min, peça câmera aberta, compartilhe tela com slides simples.',
    durationMinutes: 45,
    icon: 'videocam',
  },
  {
    format: 'Vídeo de apresentação gravado',
    description:
      'Um vídeo de 10-15 min que o lead assiste sozinho. Conversão baixa (5-8%) — serve como filtro. Quem assistir e ainda pedir conversa é lead quente qualificado.',
    useWhen: 'Lead curioso mas ocupado. Ou pra você triar grande volume antes de marcar 1 a 1. Nunca use como apresentação final.',
    durationMinutes: 12,
    icon: 'play_circle',
  },
  {
    format: 'Evento em grupo (webinar / presencial)',
    description:
      'Apresentação com 10-100 pessoas ao mesmo tempo. Energia alta, prova social forte, escala máxima. Conversão 15-25% dependendo da qualidade da lista.',
    useWhen: 'Quando você tem vários leads morno ao mesmo tempo. Ideal mensal no calendário do time. Convide com 2 semanas de antecedência.',
    durationMinutes: 90,
    icon: 'groups',
  },
];

/** Versão legada pra compat. */
export const PRESENTATION_FORMATS: string[] = PRESENTATION_FORMATS_DETAIL.map((p) => p.format);
