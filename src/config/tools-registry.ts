import { ToolDefinition, ToolCategory } from '@/types';

export const TOOLS_REGISTRY: ToolDefinition[] = [
  {
    id: 'skills-matrix',
    name: 'Aptis Skills',
    shortDescription: 'Matriz de Polivalência ILUO, identificação de gaps críticos e plano de treinamento de tutores.',
    fullDescription: 'Tenha visibilidade imediata da flexibilidade do seu quadro técnico. Mapeie operadores versus postos de trabalho através do método ILUO, identifique postos críticos sem substitutos e planeje transferências de conhecimento com precisão.',
    category: 'Gestão de Pessoas',
    route: '/dashboard/tools/skills-matrix',
    iconName: 'Grid',
    status: 'active',
    badge: 'Aptidão Técnica',
    recommendedPlan: 'starter',
    keyFeatures: [
      'Matriz Operador x Posto com níveis ILUO (1 a 4)',
      'Identificação automática de gaps de polivalência',
      'Plano de ação com tutores e prazos configuráveis',
      'Isolamento multisetorial com bloqueio entre áreas'
    ],
    colorTheme: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      hover: 'hover:border-emerald-500',
      lightBg: 'bg-emerald-50'
    }
  },
  {
    id: 'manager-tasks',
    name: 'Aptis Routine',
    shortDescription: 'Rotina diária do gestor, rituais Kamishibai, priorização Eisenhower e Passagem de Turno com exportação para WhatsApp em 1 clique.',
    fullDescription: 'Governança e padronização da liderança de chão de fábrica. Rituais de turno (Leader Standard Work / Kamishibai), priorização estratégica por Matriz de Eisenhower, fluxo Kanban com drag-and-drop e emissão instantânea de relatório de Passagem de Turno.',
    category: 'Rotina & Tarefas',
    route: '/dashboard/tools/manager-tasks',
    iconName: 'CheckSquare',
    status: 'active',
    badge: 'Aptidão de Rotina',
    recommendedPlan: 'starter',
    keyFeatures: [
      'Rituais Kamishibai com Score de Aderência em tempo real',
      'Matriz de Eisenhower com 4 quadrantes operacionais',
      'Quadro Kanban com Drag and Drop nativo e controle de SLA',
      'Passagem de Turno automatizada para WhatsApp e Teams'
    ],
    colorTheme: {
      bg: 'bg-blue-600',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:border-blue-500',
      lightBg: 'bg-blue-50'
    }
  },
  {
    id: 'training-matrix',
    name: 'Aptis Compliance',
    shortDescription: 'Normas Regulamentadoras (NRs), POPs com controle de versão, busca profunda em documentos (Deep Search) e bloqueio preventivo de linha.',
    fullDescription: 'Elimine riscos de interdição pelo Ministério do Trabalho (MTE) e garanta conformidade ISO 9001/45001. Gestão documental multi-formato (PDF, Word, TXT), pesquisa OCR profunda em documentos, matriz 2D de aptidão legal e convocador de turmas de reciclagem.',
    category: 'Capacitação & Compliance',
    route: '/dashboard/tools/training-matrix',
    iconName: 'GraduationCap',
    status: 'active',
    badge: 'Aptidão Legal',
    recommendedPlan: 'pro',
    keyFeatures: [
      'Deep Search: busca inteligente no conteúdo interno de PDFs e Word',
      'Gestão de NRs de SST e POPs industriais com versionamento',
      'Matriz 2D com Bloqueio Operacional Preventivo',
      'Convocador de turmas de reciclagem e dossiê oficial MTE/ISO'
    ],
    colorTheme: {
      bg: 'bg-amber-600',
      text: 'text-amber-600',
      border: 'border-amber-200',
      hover: 'hover:border-amber-500',
      lightBg: 'bg-amber-50'
    }
  },
  {
    id: 'kaizen-manager',
    name: 'Aptis Kaizen',
    shortDescription: 'Gestor de melhoria contínua, funil A3 e redução de perdas no chão de fábrica.',
    fullDescription: 'Engaje o time na cultura Lean de melhoria contínua. Canalize sugestões dos operadores, estruture a validação técnica, acompanhe o plano de implementação e evidencie os ganhos de produtividade, segurança e financeiros.',
    category: 'Melhoria Contínua',
    route: '/dashboard/tools/kaizen-manager',
    iconName: 'TrendingUp',
    status: 'active',
    badge: 'Inovação Lean',
    recommendedPlan: 'pro',
    keyFeatures: [
      'Funil de 4 etapas: Ideação, Análise, Implementação e Concluído',
      'Cálculo de impacto financeiro (R$) e horas salvas',
      'Categorização por Segurança, Qualidade, Custo e Ergonomia',
      'Histórico de boas práticas e padronização'
    ],
    colorTheme: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-500',
      lightBg: 'bg-indigo-50'
    }
  },
  {
    id: 'pdi-manager',
    name: 'Aptis PDI',
    shortDescription: 'Plano de Desenvolvimento Individual para cada colaborador, metodologia 70-20-10 e acompanhamento da evolução.',
    fullDescription: 'Estruture planos de desenvolvimento individual (PDI) de alta performance para cada operador e líder da fábrica. Mapeamento de forças e gaps de competência, metas estruturadas no modelo 70-20-10 (On-the-job, Mentoria e Cursos), histórico de check-ins periódicos e curva de evolução contínua.',
    category: 'Gestão de Pessoas',
    route: '/dashboard/tools/pdi-manager',
    iconName: 'Compass',
    status: 'active',
    badge: 'Pessoas & Carreira',
    recommendedPlan: 'pro',
    keyFeatures: [
      'Metodologia 70-20-10 (70% Prática na Fábrica, 20% Mentoria/Troca, 10% Cursos/Normas)',
      'Diagnóstico de competências: Forças atuais vs. Gaps para o próximo nível',
      'Check-ins periódicos com parecer do gestor e cálculo contínuo de evolução (%)',
      'Modelos prontos de PDI fabril (Operador Líder, Preparador SMED, Manutenção Autônoma)'
    ],
    colorTheme: {
      bg: 'bg-purple-600',
      text: 'text-purple-600',
      border: 'border-purple-200',
      hover: 'hover:border-purple-500',
      lightBg: 'bg-purple-50'
    }
  },
  {
    id: 'one-on-one',
    name: 'Aptis 1:1',
    shortDescription: 'Reuniões 1:1 estratégicas com o time, pautas colaborativas, transcrição ao vivo com IA e planos de ação.',
    fullDescription: 'Conduza conversas 1:1 de alto impacto com seus liderados seguindo as melhores práticas mundiais de gestão. Pautas colaborativas, termômetro de clima, banco de perguntas poderosas, gravação de áudio com transcrição em tempo real diferenciando oradores e rastreamento de compromissos mútuos.',
    category: 'Gestão de Pessoas',
    route: '/dashboard/tools/one-on-one',
    iconName: 'MessageSquareText',
    status: 'active',
    badge: 'Liderança & Pessoas',
    recommendedPlan: 'pro',
    keyFeatures: [
      'Gravação e transcrição em tempo real com separação de oradores (Gestor x Liderado)',
      'Banco de perguntas poderosas (Metodologias Andy Grove e Radical Candor)',
      'Termômetro de motivação, bem-estar e energia da equipe',
      'Plano de ação com prazos e acompanhamento contínuo de compromissos'
    ],
    colorTheme: {
      bg: 'bg-rose-600',
      text: 'text-rose-600',
      border: 'border-rose-200',
      hover: 'hover:border-rose-500',
      lightBg: 'bg-rose-50'
    }
  },
  {
    id: 'bacterial-gantt',
    name: 'Aptis Sequenciador',
    shortDescription: 'Sequenciador Gantt de Multiplicação Bacteriana, alocação finita de reatores, setup CIP e gestão de turnos.',
    fullDescription: 'Planejamento e Controle de Produção (PCP) biológico avançado. Linha do tempo visual tipo Gantt com alocação inteligente de vasos (Erlenmeyers, Balões, Tanques 100L a 5000L e Envase), detecção e bloqueio de colisões físicas, parametrização de turnos operacionais, horas extras, setup/CIP e tratativa de desvios (contaminações e trocas de rota) em tempo real.',
    category: 'Planejamento & PCP',
    route: '/dashboard/tools/bacterial-gantt',
    iconName: 'CalendarDays',
    status: 'active',
    badge: 'PCP Biológico',
    recommendedPlan: 'enterprise',
    keyFeatures: [
      'Gantt interativo com zoom ajustável e alocação dinâmica de reatores',
      'Detecção de colisão física e tempos de setup/higienização CIP pós-lote',
      'Gestão de turnos operacionais, validação de horários e horas extras',
      'Intervenções ao vivo: bloqueio por contaminação, recálculo de atrasos e troca de rota',
      'Motor de planejamento automático por meta mensal de volume (Litros)'
    ],
    colorTheme: {
      bg: 'bg-amber-600',
      text: 'text-amber-600',
      border: 'border-amber-200',
      hover: 'hover:border-amber-500',
      lightBg: 'bg-amber-50'
    }
  }
];

export const TOOL_CATEGORIES: ToolCategory[] = [
  'Rotina & Tarefas',
  'Gestão de Pessoas',
  'Capacitação & Compliance',
  'Melhoria Contínua',
  'Planejamento & PCP'
];

export function getAllTools(): ToolDefinition[] {
  return TOOLS_REGISTRY;
}

export function getActiveTools(): ToolDefinition[] {
  return TOOLS_REGISTRY.filter(t => t.status === 'active');
}

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS_REGISTRY.find(tool => tool.id === id);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS_REGISTRY.filter(tool => tool.category === category);
}
