export type Arquetipo = 'reflexivo' | 'planejador' | 'operacional' | 'performatico' | 'lideranca';

export interface PassoMeta {
  id: number;
  nome: string;
  icon: string;
  arquetipo: Arquetipo;
  descricao: string;
  xp: number;
}

export const PASSOS_V2: PassoMeta[] = [
  { id: 0, nome: 'Mentalidade', icon: 'psychology', arquetipo: 'reflexivo', descricao: 'Desenvolva o mindset de um empreendedor de sucesso', xp: 100 },
  { id: 1, nome: 'Sonhos', icon: 'auto_awesome', arquetipo: 'reflexivo', descricao: 'Defina seus sonhos e crie sua visão de futuro', xp: 100 },
  { id: 2, nome: 'Metas', icon: 'flag', arquetipo: 'planejador', descricao: 'Estabeleça metas claras e mensuráveis', xp: 150 },
  { id: 3, nome: 'Produto', icon: 'inventory_2', arquetipo: 'planejador', descricao: 'Domine o produto e torne-se referência', xp: 100 },
  { id: 4, nome: 'Lista Viva', icon: 'contacts', arquetipo: 'operacional', descricao: 'Construa sua lista quente e qualificada', xp: 150 },
  { id: 5, nome: 'Convite', icon: 'mail', arquetipo: 'performatico', descricao: 'Aprenda a convidar com maestria', xp: 150 },
  { id: 6, nome: 'Apresentação', icon: 'co_present', arquetipo: 'performatico', descricao: 'Faça apresentações irresistíveis', xp: 150 },
  { id: 7, nome: 'Fechamento', icon: 'handshake', arquetipo: 'performatico', descricao: 'Domine as 3 Leis do Fechamento', xp: 200 },
  { id: 8, nome: 'Patrocínio', icon: 'groups', arquetipo: 'lideranca', descricao: 'Patrocine e acompanhe novos membros', xp: 150 },
  { id: 9, nome: 'Formação', icon: 'school', arquetipo: 'lideranca', descricao: 'Forme líderes que formam líderes', xp: 150 },
  { id: 10, nome: 'Duplicação', icon: 'content_copy', arquetipo: 'operacional', descricao: 'Duplique o sistema e escale sua rede', xp: 200 },
];

export const ARQUETIPO_CORES: Record<Arquetipo, { bg: string; text: string; badge: string }> = {
  reflexivo: { bg: 'bg-am/10', text: 'text-am', badge: 'Reflexivo' },
  planejador: { bg: 'bg-gd/10', text: 'text-gd', badge: 'Planejador' },
  operacional: { bg: 'bg-em/10', text: 'text-em', badge: 'Operacional' },
  performatico: { bg: 'bg-or/10', text: 'text-or', badge: 'Performático' },
  lideranca: { bg: 'bg-cy/10', text: 'text-cy', badge: 'Liderança' },
};
