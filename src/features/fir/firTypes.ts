export interface FIRDados {
  conexoes: { cadastro: boolean; boasVindas: boolean; comunidade: boolean; mentor: boolean };
  sonhoTexto: string;
  sonhoImagem: string | null;
  marcos: { '1m': string; '3m': string; '6m': string; '1a': string; '2a': string };
  modoOperacao: 'flex' | 'forte' | 'elite';
  dataChegada: string;
  convitesDias: number;
  demonstracoesDias: number;
  dataReuniao: string;
  modoReuniao: 'presencial' | 'online';
  protocoloEscolhido: 'curiosidade' | 'urgencia' | 'autenticidade';
  praticouSimulador: boolean;
  contatos: string[];
}

export const INITIAL_FIR: FIRDados = {
  conexoes: { cadastro: false, boasVindas: false, comunidade: false, mentor: false },
  sonhoTexto: '',
  sonhoImagem: null,
  marcos: { '1m': '', '3m': '', '6m': '', '1a': '', '2a': '' },
  modoOperacao: 'flex',
  dataChegada: '',
  convitesDias: 7,
  demonstracoesDias: 7,
  dataReuniao: '',
  modoReuniao: 'online',
  protocoloEscolhido: 'curiosidade',
  praticouSimulador: false,
  contatos: [],
};

export const FIR_STEP_META = [
  { id: 0, titulo: 'Conecte-se ao ecossistema', icon: 'hub', xp: 100, tempo: '5 min' },
  { id: 1, titulo: 'O que te move', icon: 'favorite', xp: 150, tempo: '10 min' },
  { id: 2, titulo: 'Modo de operação', icon: 'speed', xp: 100, tempo: '3 min' },
  { id: 3, titulo: 'Seus produtos a caminho', icon: 'inventory_2', xp: 100, tempo: '5 min' },
  { id: 4, titulo: 'Monte seu ritmo', icon: 'calendar_month', xp: 150, tempo: '5 min' },
  { id: 5, titulo: 'Primeira reunião', icon: 'event', xp: 100, tempo: '3 min' },
  { id: 6, titulo: 'Protocolos de convite', icon: 'mail', xp: 200, tempo: '10 min' },
  { id: 7, titulo: 'Sua lista viva', icon: 'contacts', xp: 200, tempo: '10 min' },
];

export const TOTAL_XP = FIR_STEP_META.reduce((s, m) => s + m.xp, 0) + 200; // +200 bônus conclusão
