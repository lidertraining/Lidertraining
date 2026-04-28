/**
 * Classificação inteligente de leads baseada em léxicos PT-BR e padrões.
 *
 * Como funciona:
 *   1. Roda regras heurísticas determinísticas (familiaria, profissional, contextual, íntimo)
 *   2. Cruza com sinais do VCF (CATEGORIES, NICKNAME, ORG, TITLE)
 *   3. Atribui categoria + temperatura + tags + evidências
 *   4. Calcula confidence score (0-100)
 *
 * Tudo offline, sem custo, sem API externa. ~50ms pra classificar 200 leads.
 *
 * Dimensões classificadas:
 *   - category: familia | amigo_proximo | conhecido | profissional | desconhecido
 *   - temperatura: quente | morno | frio
 *   - whatsapp_status: ativo | inativo | desconhecido (preenchido pelo uso real)
 *   - score_icp: 0-100 (preenchido em fase futura por ML)
 *   - tags: array de palavras-chave detectadas
 *   - evidencias: jsonb com motivos da classificação (auditoria)
 */

// ============================================================
// TIPOS
// ============================================================

export type LeadCategory =
  | 'familia'
  | 'amigo_proximo'
  | 'conhecido'
  | 'profissional'
  | 'desconhecido';

export type LeadTemperatura = 'quente' | 'morno' | 'frio';

export type LeadWhatsAppStatus = 'ativo' | 'inativo' | 'desconhecido';

export interface ClassificationEvidence {
  /** Padrão que disparou (ex: "lexico_familia", "title_dr", "nickname"). */
  pattern: string;
  /** Trecho que casou no input. */
  matched: string;
  /** Onde foi detectado. */
  source: 'name' | 'nickname' | 'org' | 'title' | 'category' | 'related';
}

export interface LeadClassification {
  category: LeadCategory;
  temperatura: LeadTemperatura;
  tags: string[];
  evidencias: ClassificationEvidence[];
  /** 0-100. Quanto maior, mais certeza temos. */
  confidence: number;
}

export interface ClassifyInput {
  name: string;
  nickname?: string | undefined;
  organization?: string | undefined;
  title?: string | undefined;
  /** CATEGORIES do VCF iPhone (ex: ['Família', 'Amigos']). */
  vcfCategories?: string[] | undefined;
  /** X-ABRELATEDNAMES do VCF (ex: [{type:'Mãe', value:'Maria'}]). */
  relatedNames?: Array<{ type: string; value: string }> | undefined;
}

// ============================================================
// LÉXICOS PT-BR
// ============================================================

/**
 * Palavras que indicam relação familiar direta.
 * Ordem importa: padrões mais específicos primeiro (Mãezinha antes de Mãe).
 */
const LEXICO_FAMILIA: Array<{ pattern: RegExp; tag: string }> = [
  // Pais e mães (com diminutivos e variações regionais)
  { pattern: /(?<![\p{L}])(m[ãa]ezinha|m[ãa]ezona|mam[ãa]e|m[ãa]e)(?![\p{L}])/iu, tag: 'mae' },
  { pattern: /(?<![\p{L}])(painho|papai|paizinho|pai)(?![\p{L}])/iu, tag: 'pai' },
  { pattern: /(?<![\p{L}])pais(?![\p{L}])/iu, tag: 'pais' },

  // Avós (cobre Vó, Vô, Vovó, Vovô, Avó, Avô, Vovinha, Vozinha)
  { pattern: /(?<![\p{L}])(vov[óôo]vinha|vov[óôo]zinha|vov[óôo]|av[óôo]|v[óô])(?![\p{L}])/iu, tag: 'avo' },

  // Irmãos
  { pattern: /(?<![\p{L}])(irm[ãa]o|irm[ãa])(?![\p{L}])/iu, tag: 'irmao' },

  // Tios e primos
  { pattern: /(?<![\p{L}])(titia|titio|tio|tia)(?![\p{L}])/iu, tag: 'tio_tia' },
  { pattern: /(?<![\p{L}])(primo|prima)(?![\p{L}])/iu, tag: 'primo' },

  // Filhos
  { pattern: /(?<![\p{L}])(filhinh[oa]|filh[oa])(?![\p{L}])/iu, tag: 'filho' },
  { pattern: /(?<![\p{L}])(sobrinh[oa])(?![\p{L}])/iu, tag: 'sobrinho' },
  { pattern: /(?<![\p{L}])(neto|neta)(?![\p{L}])/iu, tag: 'neto' },

  // Cônjuge
  { pattern: /(?<![\p{L}])(marido|esposa|esposo|mulher|companheir[oa])(?![\p{L}])/iu, tag: 'conjuge' },
  { pattern: /(?<![\p{L}])c[ôo]njuge(?![\p{L}])/iu, tag: 'conjuge' },

  // Família por afinidade
  { pattern: /(?<![\p{L}])(cunhad[oa])(?![\p{L}])/iu, tag: 'cunhado' },
  { pattern: /(?<![\p{L}])(sogr[oa])(?![\p{L}])/iu, tag: 'sogro' },
  { pattern: /(?<![\p{L}])(genro|nora)(?![\p{L}])/iu, tag: 'genro_nora' },
  { pattern: /(?<![\p{L}])(padrasto|madrasta)(?![\p{L}])/iu, tag: 'padrasto' },
  { pattern: /(?<![\p{L}])(enteado|enteada)(?![\p{L}])/iu, tag: 'enteado' },
  { pattern: /(?<![\p{L}])(madrinha|padrinho)(?![\p{L}])/iu, tag: 'padrinho' },
  { pattern: /(?<![\p{L}])(afilhad[oa])(?![\p{L}])/iu, tag: 'afilhado' },
];

/**
 * Padrões profissionais: títulos, cargos, indicação de empresa no nome.
 */
const LEXICO_PROFISSIONAL: Array<{ pattern: RegExp; tag: string }> = [
  // Títulos acadêmicos / profissionais (com ou sem ponto)
  { pattern: /(?<![\p{L}])dr[a]?\.?\s/iu, tag: 'titulo_dr' },
  { pattern: /(?<![\p{L}])prof[a]?\.?\s/iu, tag: 'titulo_prof' },
  { pattern: /(?<![\p{L}])eng\.?\s/iu, tag: 'titulo_eng' },
  { pattern: /(?<![\p{L}])adv\.?\s/iu, tag: 'titulo_adv' },
  { pattern: /(?<![\p{L}])pe\.\s/iu, tag: 'titulo_padre' },
  { pattern: /(?<![\p{L}])pr\.\s/iu, tag: 'titulo_pastor' },
  { pattern: /(?<![\p{L}])sr[a]?\.\s/iu, tag: 'titulo_sr' },
  { pattern: /(?<![\p{L}])coord\.?\s/iu, tag: 'titulo_coord' },
  { pattern: /(?<![\p{L}])(ceo|cto|cfo|coo)(?![\p{L}])/iu, tag: 'titulo_csuite' },
  { pattern: /(?<![\p{L}])(diretor|diretora|gerente|presidente|gestor|gestora)(?![\p{L}])/iu, tag: 'cargo' },
  { pattern: /(?<![\p{L}])(supervisor|coordenador|coordenadora)(?![\p{L}])/iu, tag: 'cargo' },

  // Indicação de empresa no nome ("João - Acme", "Maria @Empresa")
  { pattern: /\s-\s\S{2,}/iu, tag: 'empresa_traco' },
  { pattern: /(^|\s)@\w{2,}/iu, tag: 'empresa_arroba' },
];

/**
 * Padrões contextuais: "do/da Local", indicando como você conheceu.
 */
const LEXICO_CONTEXTUAL: Array<{ pattern: RegExp; tag: string }> = [
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+mercado(?![\p{L}])/iu, tag: 'ctx_mercado' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+padaria(?![\p{L}])/iu, tag: 'ctx_padaria' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+pr[ée]dio(?![\p{L}])/iu, tag: 'ctx_predio' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+(condom[ií]nio|cond[oô]minio)(?![\p{L}])/iu, tag: 'ctx_condominio' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+trabalho(?![\p{L}])/iu, tag: 'ctx_trabalho' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+escrit[óo]rio(?![\p{L}])/iu, tag: 'ctx_trabalho' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+academia(?![\p{L}])/iu, tag: 'ctx_academia' },
  { pattern: /(?<![\p{L}])(da|do|dos|das)\s+igreja(?![\p{L}])/iu, tag: 'ctx_igreja' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+(escola|col[ée]gio|faculdade|universidade)(?![\p{L}])/iu, tag: 'ctx_escola' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+sal[ãa]o(?![\p{L}])/iu, tag: 'ctx_salao' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+uber(?![\p{L}])/iu, tag: 'ctx_uber' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+feira(?![\p{L}])/iu, tag: 'ctx_feira' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+bairro(?![\p{L}])/iu, tag: 'ctx_bairro' },
  { pattern: /(?<![\p{L}])(do|da|dos|das)\s+(curso|treinamento|workshop)(?![\p{L}])/iu, tag: 'ctx_curso' },
];

/**
 * Padrões de intimidade: apelidos carinhosos, diminutivos, formas íntimas.
 */
const LEXICO_INTIMO: Array<{ pattern: RegExp; tag: string }> = [
  // Apelidos genéricos
  { pattern: /(?<![\p{L}])(bro|mano|mana|brother|migs|miga|migo)(?![\p{L}])/iu, tag: 'apelido_amigo' },
  { pattern: /(?<![\p{L}])(amor|querid[oa]|lind[ãa]o?)(?![\p{L}])/iu, tag: 'apelido_carinho' },
];

/**
 * Categorias do VCF iPhone (CATEGORIES) com mapeamento para nossa taxonomia.
 */
const VCF_CATEGORY_MAP: Record<string, { category: LeadCategory; tag: string }> = {
  'família': { category: 'familia', tag: 'vcf_familia' },
  'familia': { category: 'familia', tag: 'vcf_familia' },
  'family': { category: 'familia', tag: 'vcf_familia' },
  'amigos': { category: 'amigo_proximo', tag: 'vcf_amigos' },
  'amigo': { category: 'amigo_proximo', tag: 'vcf_amigos' },
  'friends': { category: 'amigo_proximo', tag: 'vcf_amigos' },
  'trabalho': { category: 'profissional', tag: 'vcf_trabalho' },
  'work': { category: 'profissional', tag: 'vcf_trabalho' },
  'colegas': { category: 'profissional', tag: 'vcf_trabalho' },
};

/**
 * Tipos de relacionamento do X-ABRELATEDNAMES com mapeamento.
 * iPhone permite marcar pessoas como "Mãe", "Cônjuge", "Filho" diretamente.
 */
const RELATED_TYPE_MAP: Record<string, { category: LeadCategory; tag: string }> = {
  'mother': { category: 'familia', tag: 'rel_mae' },
  'father': { category: 'familia', tag: 'rel_pai' },
  'parent': { category: 'familia', tag: 'rel_pais' },
  'spouse': { category: 'familia', tag: 'rel_conjuge' },
  'partner': { category: 'familia', tag: 'rel_conjuge' },
  'child': { category: 'familia', tag: 'rel_filho' },
  'brother': { category: 'familia', tag: 'rel_irmao' },
  'sister': { category: 'familia', tag: 'rel_irmao' },
  'friend': { category: 'amigo_proximo', tag: 'rel_amigo' },
  'manager': { category: 'profissional', tag: 'rel_chefe' },
  'assistant': { category: 'profissional', tag: 'rel_trabalho' },
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Detecta se o nome é só primeiro nome (sinal de proximidade).
 * "João" → true. "João Silva" → false. "Dr. João" → false (tem prefixo).
 */
function isJustFirstName(name: string): boolean {
  const cleaned = name.trim().replace(/\s+/g, ' ');
  if (!cleaned) return false;
  // Tira prefixos comuns
  const withoutPrefix = cleaned.replace(/^(dr|dra|prof|profa|eng|sr|sra|pe|pr)\.?\s+/i, '');
  const parts = withoutPrefix.split(/\s+/);
  if (parts.length !== 1 || parts[0]!.length < 2) return false;
  // Tem que ter pelo menos uma letra real (rejeita "12345", "@@##")
  return /[A-Za-zÀ-ÿ]/.test(parts[0]!);
}

/**
 * Detecta diminutivos no final do nome (-inho, -inha, -ito, -ita).
 * "Joãozinho" → true. "João" → false.
 * Filtros: só pega se o nome todo for ≤15 chars (evita falsos com sobrenomes).
 */
function hasDiminutive(name: string): boolean {
  const cleaned = name.trim();
  if (!cleaned || cleaned.length > 20) return false;
  const lower = cleaned.toLowerCase();
  // Última palavra termina com diminutivo?
  const lastWord = lower.split(/\s+/).pop() ?? '';
  if (lastWord.length < 5) return false; // muito curto pra ter diminutivo
  return /(inho|inha|ito|ita|zinho|zinha|zito|zita)$/.test(lastWord);
}

/**
 * Verifica se o nome inteiro está só com primeiro nome + sobrenome curto
 * (formato familiar, ex: "Maria Silva", "Carlos Souza").
 */
function isFullName(name: string): boolean {
  const cleaned = name.trim().replace(/\s+/g, ' ');
  const parts = cleaned.split(/\s+/);
  return parts.length >= 2 && parts.every((p) => /^[A-Za-zÀ-ÿ]+$/.test(p));
}

// ============================================================
// CLASSIFICADOR PRINCIPAL
// ============================================================

/**
 * Classifica um lead com base nos sinais disponíveis.
 *
 * Ordem de prioridade (high signal vence baixo):
 *   1. X-ABRELATEDNAMES (iPhone marca como "mãe", "cônjuge") → certeza
 *   2. CATEGORIES do VCF (Família, Amigos) → alta confiança
 *   3. Léxico família no nome → alta confiança
 *   4. Léxico profissional → média-alta
 *   5. Léxico contextual ("do prédio") → média
 *   6. Léxico íntimo + diminutivos → média
 *   7. Padrão "só primeiro nome" → baixa
 *   8. Default → desconhecido, frio
 */
export function classifyLead(input: ClassifyInput): LeadClassification {
  const evidencias: ClassificationEvidence[] = [];
  const tags = new Set<string>();
  let category: LeadCategory = 'desconhecido';
  let temperatura: LeadTemperatura = 'frio';
  let confidence = 30;

  const name = (input.name ?? '').trim();
  const nickname = (input.nickname ?? '').trim();
  const organization = (input.organization ?? '').trim();
  const title = (input.title ?? '').trim();
  const vcfCategories = input.vcfCategories ?? [];
  const relatedNames = input.relatedNames ?? [];

  // ── 1. X-ABRELATEDNAMES (sinal mais forte: iPhone marcou explicitamente)
  for (const rel of relatedNames) {
    const lowerType = rel.type.toLowerCase().trim();
    const mapped = RELATED_TYPE_MAP[lowerType];
    if (mapped) {
      category = mapped.category;
      temperatura = mapped.category === 'familia' ? 'quente' : 'morno';
      tags.add(mapped.tag);
      confidence = 95;
      evidencias.push({
        pattern: 'related_name',
        matched: rel.type,
        source: 'related',
      });
    }
  }

  // ── 2. CATEGORIES do VCF (sinal forte: usuário marcou no iPhone)
  for (const cat of vcfCategories) {
    const lower = cat.toLowerCase().trim();
    const mapped = VCF_CATEGORY_MAP[lower];
    if (mapped) {
      // Se ainda não temos certeza alta, usa o VCF
      if (confidence < 90) {
        category = mapped.category;
        temperatura =
          mapped.category === 'familia'
            ? 'quente'
            : mapped.category === 'amigo_proximo'
              ? 'morno'
              : 'morno';
        confidence = Math.max(confidence, 85);
      }
      tags.add(mapped.tag);
      evidencias.push({
        pattern: 'vcf_category',
        matched: cat,
        source: 'category',
      });
    }
  }

  // ── 3. Léxico família no nome (sinal forte)
  if (name) {
    for (const lex of LEXICO_FAMILIA) {
      const match = name.match(lex.pattern);
      if (match) {
        if (confidence < 90) {
          category = 'familia';
          temperatura = 'quente';
          confidence = Math.max(confidence, 88);
        }
        tags.add(`familia_${lex.tag}`);
        evidencias.push({
          pattern: `lexico_familia_${lex.tag}`,
          matched: match[0],
          source: 'name',
        });
        break; // 1 match basta
      }
    }
  }

  // ── 4. Léxico profissional (sinal médio-forte)
  let hasProfessionalSignal = false;
  if (name) {
    for (const lex of LEXICO_PROFISSIONAL) {
      const match = name.match(lex.pattern);
      if (match) {
        hasProfessionalSignal = true;
        tags.add(`prof_${lex.tag}`);
        evidencias.push({
          pattern: `lexico_profissional_${lex.tag}`,
          matched: match[0].trim(),
          source: 'name',
        });
        break;
      }
    }
  }

  // ORG e TITLE também sinalizam profissional (sem sobrescrever família)
  if (organization) {
    hasProfessionalSignal = true;
    tags.add('tem_org');
    evidencias.push({
      pattern: 'tem_organization',
      matched: organization,
      source: 'org',
    });
  }
  if (title) {
    hasProfessionalSignal = true;
    tags.add('tem_title');
    evidencias.push({
      pattern: 'tem_title',
      matched: title,
      source: 'title',
    });
  }

  if (hasProfessionalSignal && category === 'desconhecido') {
    category = 'profissional';
    temperatura = 'morno';
    confidence = 75;
  } else if (hasProfessionalSignal && category === 'familia') {
    // Família + título profissional (ex: "Dr. João - irmão") → mantém família mas adiciona tag
    tags.add('familia_com_carreira');
  }

  // ── 5. Léxico contextual ("do prédio")
  if (name) {
    for (const lex of LEXICO_CONTEXTUAL) {
      const match = name.match(lex.pattern);
      if (match) {
        if (category === 'desconhecido') {
          category = 'conhecido';
          temperatura = 'morno';
          confidence = 65;
        }
        tags.add(`ctx_${lex.tag}`);
        evidencias.push({
          pattern: `lexico_contextual_${lex.tag}`,
          matched: match[0],
          source: 'name',
        });
        break;
      }
    }
  }

  // ── 6. Léxico íntimo + diminutivos
  let hasIntimateSignal = false;
  if (name) {
    for (const lex of LEXICO_INTIMO) {
      const match = name.match(lex.pattern);
      if (match) {
        hasIntimateSignal = true;
        tags.add(`int_${lex.tag}`);
        evidencias.push({
          pattern: `lexico_intimo_${lex.tag}`,
          matched: match[0],
          source: 'name',
        });
        break;
      }
    }

    if (!hasIntimateSignal && hasDiminutive(name)) {
      hasIntimateSignal = true;
      tags.add('int_diminutivo');
      evidencias.push({
        pattern: 'diminutive',
        matched: name.split(/\s+/).pop() ?? name,
        source: 'name',
      });
    }
  }

  // NICKNAME é sinal forte de intimidade
  if (nickname) {
    hasIntimateSignal = true;
    tags.add('tem_nickname');
    evidencias.push({
      pattern: 'has_nickname',
      matched: nickname,
      source: 'nickname',
    });
  }

  if (hasIntimateSignal && category === 'desconhecido') {
    category = 'amigo_proximo';
    temperatura = 'morno';
    confidence = 60;
  } else if (hasIntimateSignal && (category === 'conhecido' || category === 'profissional')) {
    if (category === 'conhecido') {
      category = 'amigo_proximo';
      confidence = Math.max(confidence, 70);
    }
  }

  // ── 7. Padrão "só primeiro nome" (sinal fraco)
  if (category === 'desconhecido' && name && isJustFirstName(name)) {
    category = 'amigo_proximo';
    temperatura = 'morno';
    confidence = 50;
    tags.add('so_primeiro_nome');
    evidencias.push({
      pattern: 'first_name_only',
      matched: name,
      source: 'name',
    });
  }

  // ── 8. Nome completo formal sem outros sinais → conhecido
  if (category === 'desconhecido' && name && isFullName(name)) {
    category = 'conhecido';
    temperatura = 'frio';
    confidence = 45;
    tags.add('nome_completo');
    evidencias.push({
      pattern: 'full_name_formal',
      matched: name,
      source: 'name',
    });
  }

  return {
    category,
    temperatura,
    tags: Array.from(tags),
    evidencias,
    confidence,
  };
}

// ============================================================
// AGREGADORES
// ============================================================

export interface ClassificationStats {
  total: number;
  byCategory: Record<LeadCategory, number>;
  byTemperatura: Record<LeadTemperatura, number>;
  avgConfidence: number;
}

export function aggregateStats(
  classifications: LeadClassification[],
): ClassificationStats {
  const byCategory: Record<LeadCategory, number> = {
    familia: 0,
    amigo_proximo: 0,
    conhecido: 0,
    profissional: 0,
    desconhecido: 0,
  };
  const byTemperatura: Record<LeadTemperatura, number> = {
    quente: 0,
    morno: 0,
    frio: 0,
  };
  let totalConfidence = 0;

  for (const c of classifications) {
    byCategory[c.category]++;
    byTemperatura[c.temperatura]++;
    totalConfidence += c.confidence;
  }

  return {
    total: classifications.length,
    byCategory,
    byTemperatura,
    avgConfidence: classifications.length > 0 ? totalConfidence / classifications.length : 0,
  };
}

// ============================================================
// LABELS HUMANOS
// ============================================================

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  familia: 'Família',
  amigo_proximo: 'Amigo próximo',
  conhecido: 'Conhecido',
  profissional: 'Profissional',
  desconhecido: 'A descobrir',
};

export const TEMPERATURA_LABELS: Record<LeadTemperatura, string> = {
  quente: 'Quente',
  morno: 'Morno',
  frio: 'Frio',
};

export const CATEGORY_EMOJIS: Record<LeadCategory, string> = {
  familia: '❤️',
  amigo_proximo: '🤝',
  conhecido: '👋',
  profissional: '💼',
  desconhecido: '👤',
};
