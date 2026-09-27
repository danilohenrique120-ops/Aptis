import {
  ConsultingClient,
  MaturityPillar,
  ProjectDeliverable,
  FinancialImpactGain,
  GovernanceMeeting,
} from './types';

export const INITIAL_ADVISORY_CLIENTS: ConsultingClient[] = [
  {
    id: 'cli-adv-1',
    name: 'Grupo Indústrias Reunidas Alvorada S.A.',
    tradeName: 'Alvorada Metais & Usinagem',
    cnpj: '45.109.882/0001-90',
    segment: 'Metalmecânica & Linha Branca',
    sponsorName: 'Dr. Roberto Fagundes',
    sponsorRole: 'CEO / Diretor Presidente',
    sponsorEmail: 'roberto.fagundes@alvorada.ind.br',
    sponsorPhone: '(11) 99876-1020',
    consultantLead: 'Danilo Henrique (Sócio de Consultoria)',
    contractValueMonthly: 18500,
    totalContractValue: 111000,
    startDate: '2026-05-01',
    targetEndDate: '2026-10-31',
    status: 'active',
    projectGoal:
      'Reestruturação da governança operacional, redução de desperdícios no chão de fábrica e aumento da margem EBITDA em 4 p.p.',
    inScopeSummary: [
      'Mapeamento dos 5 macroprocessos críticos de usinagem e montagem',
      'Estruturação de rituais de governança (DOR diário, WAR semanal e MOR mensal)',
      'Implantação de matriz de competências e plano de nivelamento operacional',
      'Auditoria de perdas e apuração de oportunidades de redução de custos (Cost Out)',
    ],
    outOfScopeSummary: [
      'Implementação de novo software ERP / desenvolvimento de software customizado',
      'Assessoria jurídica, contábil ou tributária para fusões e aquisições',
      'Negociação direta com sindicatos ou substituição de gerentes executivos',
    ],
    clientTeam: [
      {
        name: 'Roberto Fagundes',
        role: 'CEO & Sponsor Executivo',
        email: 'roberto.fagundes@alvorada.ind.br',
        phone: '(11) 99876-1020',
      },
      {
        name: 'Mariana Esteves',
        role: 'Gerente Geral de Operações (Líder Interno)',
        email: 'mariana.esteves@alvorada.ind.br',
        phone: '(11) 98711-4433',
      },
      {
        name: 'Carlos Paiva',
        role: 'Coordenador de Qualidade & Processos',
        email: 'carlos.paiva@alvorada.ind.br',
        phone: '(11) 99122-8877',
      },
      {
        name: 'Fernando Guimarães',
        role: 'Controller Financeiro',
        email: 'fernando.guimaraes@alvorada.ind.br',
        phone: '(11) 97100-3322',
      },
    ],
  },
  {
    id: 'cli-adv-2',
    name: 'Nexus Health Tech & Diagnósticos Clínicos',
    tradeName: 'Nexus Saúde',
    cnpj: '28.309.412/0001-11',
    segment: 'Saúde, Laboratórios & Farmacêutica',
    sponsorName: 'Dra. Clarissa Bittencourt',
    sponsorRole: 'COO & Sócia Fundadora',
    sponsorEmail: 'clarissa.b@nexussaude.com.br',
    sponsorPhone: '(21) 98112-9900',
    consultantLead: 'Danilo Henrique',
    contractValueMonthly: 24000,
    totalContractValue: 192000,
    startDate: '2026-03-01',
    targetEndDate: '2026-10-31',
    status: 'active',
    projectGoal:
      'Padronização de esteiras de exames laboratoriais, redução de tempo de laudo de 48h para 12h e acreditação ONA nível 3.',
    inScopeSummary: [
      'Desenho do fluxo Lean Healthcare da coleta à liberação do laudo',
      'Implantação de quadro Kanban físico e digital de amostras críticas',
      'Treinamento de liderança em 1:1 e alinhamento de metas da equipe médica',
    ],
    outOfScopeSummary: [
      'Compra de analisadores bioquímicos e equipamentos médicos',
      'Reformas físicas e obras civis das unidades de atendimento',
    ],
    clientTeam: [
      {
        name: 'Dra. Clarissa Bittencourt',
        role: 'COO & Sponsor',
        email: 'clarissa.b@nexussaude.com.br',
      },
      {
        name: 'Dr. Leonardo Reis',
        role: 'Responsável Técnico Laboratorial',
        email: 'leonardo.reis@nexussaude.com.br',
      },
    ],
  },
  {
    id: 'cli-adv-3',
    name: 'Vanguard Logística & Cadeia de Frio Ltda',
    tradeName: 'Vanguard Supply Chain',
    cnpj: '11.902.100/0001-87',
    segment: 'Logística & Centros de Distribuição',
    sponsorName: 'Eng. Marcelo Fontes',
    sponsorRole: 'Diretor de Supply Chain',
    sponsorEmail: 'marcelo.fontes@vanguardlog.com.br',
    sponsorPhone: '(31) 99220-4411',
    consultantLead: 'Danilo Henrique',
    contractValueMonthly: 14000,
    totalContractValue: 84000,
    startDate: '2026-06-01',
    targetEndDate: '2026-11-30',
    status: 'active',
    projectGoal:
      'Otimização de picking em armazém vertical e redução do custo por caixa expedida em 18%.',
    inScopeSummary: [
      'Balanceamento de linhas de separação e expedição',
      'Gestão de indicadores operacionais (OTIF, Acuracidade de Estoque)',
    ],
    outOfScopeSummary: ['Negociação de frete com transportadoras terceiras'],
    clientTeam: [
      {
        name: 'Marcelo Fontes',
        role: 'Diretor de Operações',
        email: 'marcelo.fontes@vanguardlog.com.br',
      },
    ],
  },
];

export const INITIAL_MATURITY_PILLARS: MaturityPillar[] = [
  {
    id: 'pil-1',
    name: '1. Governança & Rituais de Gestão',
    description:
      'Frequência, disciplina e alinhamento de reuniões de rotina (Diária, Semanal e Mensal com atas e planos de ação).',
    initialScore: 1.8,
    currentScore: 4.2,
    targetScore: 4.8,
    initialNotes:
      'Não havia rituais formais. Problemas eram discutidos em corredores ou em reuniões emergenciais desestruturadas.',
    currentNotes:
      'Rituais diários de 15 min implantados em todos os turnos. Reunião mensal com ata e 100% de presença da diretoria.',
  },
  {
    id: 'pil-2',
    name: '2. Padronização & Eficiência de Processos',
    description:
      'Procedimentos Operacionais Padrão (POPs), Lições de Ponto Único (OPL) e controle de desperdícios no Gemba.',
    initialScore: 2.1,
    currentScore: 4.0,
    targetScore: 4.5,
    initialNotes:
      'Cada operador executava as tarefas ao seu modo. Alto índice de retrabalho por falta de padrão documentado.',
    currentNotes:
      '18 POPs críticos revisados e validados com os operadores. Sistema de gestão de ideias Kaizen ativo.',
  },
  {
    id: 'pil-3',
    name: '3. Gestão à Vista & Indicadores Confiáveis',
    description:
      'Painéis visuais no chão de fábrica, confiabilidade de dados e acompanhamento de metas em tempo real.',
    initialScore: 1.4,
    currentScore: 3.8,
    targetScore: 4.5,
    initialNotes:
      'Indicadores eram calculados manualmente em planilhas 20 dias após o fechamento do mês, impossibilitando reação rápida.',
    currentNotes:
      'Quadros de gestão à vista atualizados diariamente na linha. Gestores sabem o OEE e a eficiência do turno no mesmo dia.',
  },
  {
    id: 'pil-4',
    name: '4. Desenvolvimento de Lideranças & Pessoas',
    description:
      'Matriz de competências, rituais de feedback 1:1, planos de desenvolvimento e clima organizacional.',
    initialScore: 2.5,
    currentScore: 3.9,
    targetScore: 4.5,
    initialNotes:
      'Supervisores atuavam apenas como "bombeiros", apagando incêndios operacionais sem tempo para liderar.',
    currentNotes:
      'Líderes treinados no método Aptis 1:1 e PDI. Reuniões individuais de desenvolvimento realizadas quinzenalmente.',
  },
  {
    id: 'pil-5',
    name: '5. Controle de Custos & Rentabilidade',
    description:
      'Visibilidade sobre custos unitários, controle de perdas materiais e apuração de ROI em melhorias.',
    initialScore: 2.0,
    currentScore: 4.1,
    targetScore: 4.8,
    initialNotes:
      'A empresa não sabia o custo real de refugo por linha de produto e os rateios eram imprecisos.',
    currentNotes:
      'Painel de Cost Out semanal implantado com economia comprovada e validada pelo departamento financeiro.',
  },
];

export const INITIAL_DELIVERABLES: ProjectDeliverable[] = [
  {
    id: 'del-1',
    clientId: 'cli-adv-1',
    title: 'Diagnóstico Operacional 360º & Matriz de Maturidade Inicial',
    phase: 'diagnostico',
    status: 'completed',
    responsibleConsultant: 'Danilo Henrique',
    responsibleClientPeer: 'Mariana Esteves',
    dueDate: '2026-05-20',
    completionDate: '2026-05-18',
    deliverableSummary:
      'Levantamento detalhado dos 5 pilares, entrevistas com 14 lideranças e aplicação do Radar de Maturidade.',
    evidenceDocName: 'Relatorio_Diagnostico_360_Alvorada_vFinal.pdf',
  },
  {
    id: 'del-2',
    clientId: 'cli-adv-1',
    title: 'Desenho da Nova Arquitetura de Rituais de Gestão (DOR/WAR/MOR)',
    phase: 'desenho',
    status: 'completed',
    responsibleConsultant: 'Danilo Henrique',
    responsibleClientPeer: 'Mariana Esteves',
    dueDate: '2026-06-15',
    completionDate: '2026-06-12',
    deliverableSummary:
      'Manual de governança operacional contendo cadência, papéis, regras de ata e painéis de gestão à vista.',
    evidenceDocName: 'Manual_Rituais_Governanca_Alvorada.pdf',
  },
  {
    id: 'del-3',
    clientId: 'cli-adv-1',
    title: 'Implantação dos Quadros de Gestão à Vista e Rito Diário no Setor 1',
    phase: 'implantacao',
    status: 'completed',
    responsibleConsultant: 'Danilo Henrique',
    responsibleClientPeer: 'Carlos Paiva',
    dueDate: '2026-07-10',
    completionDate: '2026-07-08',
    deliverableSummary:
      'Quadros instalados e treinados os 3 turnos de usinagem com o ritual matinal de 15 minutos em pé.',
    evidenceDocName: 'Evidencias_Fotograficas_Implantacao_QG.pdf',
  },
  {
    id: 'del-4',
    clientId: 'cli-adv-1',
    title: 'Validação da Nova Matriz de Rateio e Custos de Refugo',
    phase: 'implantacao',
    status: 'blocked_by_client',
    responsibleConsultant: 'Danilo Henrique',
    responsibleClientPeer: 'Fernando Guimarães (Controller)',
    dueDate: '2026-08-30',
    blockedSince: '2026-08-25',
    blockReason:
      'Aguardando envio das planilhas de rateio contábil pela equipe de Controladoria do cliente (atraso de 14 dias).',
    deliverableSummary:
      'Modelo de custeio padronizado para alimentar o painel de ROI e economia mensal por centro de custo.',
  },
  {
    id: 'del-5',
    clientId: 'cli-adv-1',
    title: 'Capacitação das Lideranças em Feedback 1:1 e PDI Operacional',
    phase: 'implantacao',
    status: 'in_progress',
    responsibleConsultant: 'Danilo Henrique',
    responsibleClientPeer: 'Mariana Esteves',
    dueDate: '2026-09-30',
    deliverableSummary:
      'Workshops práticos com 8 supervisores e implantação da ferramenta Aptis 1:1 na fábrica.',
  },
  {
    id: 'del-6',
    clientId: 'cli-adv-1',
    title: 'Auditoria de Sustentação & Passagem de Bastão para o Time Interno',
    phase: 'sustentacao',
    status: 'backlog',
    responsibleConsultant: 'Danilo Henrique',
    responsibleClientPeer: 'Roberto Fagundes (CEO)',
    dueDate: '2026-10-25',
    deliverableSummary:
      'Auditoria de conformidade dos rituais sem presença do consultor para garantir autonomia e perenidade.',
  },
  {
    id: 'del-7',
    clientId: 'cli-adv-2',
    title: 'Mapeamento do Fluxo de Valor de Amostras Laboratoriais (VSM)',
    phase: 'diagnostico',
    status: 'completed',
    responsibleConsultant: 'Danilo Henrique',
    responsibleClientPeer: 'Dr. Leonardo Reis',
    dueDate: '2026-04-10',
    completionDate: '2026-04-08',
    deliverableSummary: 'Identificação de 14 gargalos de tempo de espera entre a centrífuga e a bancada analítica.',
  },
  {
    id: 'del-8',
    clientId: 'cli-adv-3',
    title: 'Balanceamento de Equipes de Separação Noturna no Galpão 02',
    phase: 'desenho',
    status: 'in_progress',
    responsibleConsultant: 'Danilo Henrique',
    responsibleClientPeer: 'Marcelo Fontes',
    dueDate: '2026-10-15',
    deliverableSummary: 'Redistribuição de operadores com base no histórico de volume horária de pedidos.',
  },
];

export const INITIAL_FINANCIAL_GAINS: FinancialImpactGain[] = [
  {
    id: 'gn-1',
    clientId: 'cli-adv-1',
    title: 'Eliminação de Refugo na Linha de Eixos por Poka-Yoke de Fixação',
    category: 'cost_reduction',
    recurrence: 'annual',
    verifiedAmount: 148000,
    status: 'audited',
    validatedByName: 'Fernando Guimarães (Controller)',
    validatedAt: '2026-08-15',
    description:
      'Após o diagnóstico de causa raiz, implantamos dispositivo mecânico à prova de erros. O refugo caiu de 3.8% para 0.2%, gerando R$ 148.000 de economia anualizada em matéria-prima.',
  },
  {
    id: 'gn-2',
    clientId: 'cli-adv-1',
    title: 'Renegociação de Insumos de Usinagem (Pastilhas de Metal Duro)',
    category: 'cost_reduction',
    recurrence: 'annual',
    verifiedAmount: 76000,
    status: 'validated_by_client',
    validatedByName: 'Mariana Esteves (Gerente Operações)',
    validatedAt: '2026-07-28',
    description:
      'Padronização dos tipos de insertos utilizados e negociação de volume anual com o fornecedor principal com ganho de escala.',
  },
  {
    id: 'gn-3',
    clientId: 'cli-adv-1',
    title: 'Redução de Horas Extras por Nivelamento de Turnos e Gestão à Vista',
    category: 'time_saved',
    recurrence: 'annual',
    verifiedAmount: 114000,
    status: 'validated_by_client',
    validatedByName: 'Roberto Fagundes (CEO)',
    validatedAt: '2026-09-10',
    description:
      'A governança diária evitou acúmulo de pedidos nos finais de semana, reduzindo o banco de horas extras em 42% no segundo trimestre.',
  },
  {
    id: 'gn-4',
    clientId: 'cli-adv-2',
    title: 'Aumento de Capacidade de Exames sem Adicionar Turno Noturno',
    category: 'revenue_increase',
    recurrence: 'annual',
    verifiedAmount: 210000,
    status: 'audited',
    validatedByName: 'Dra. Clarissa Bittencourt (COO)',
    validatedAt: '2026-08-30',
    description:
      'Otimização do fluxo Lean das esteiras bioquímicas liberou 25% a mais de capacidade de processamento com a mesma infraestrutura.',
  },
];

export const INITIAL_GOVERNANCE_MEETINGS: GovernanceMeeting[] = [
  {
    id: 'meet-1',
    clientId: 'cli-adv-1',
    date: '2026-09-22',
    type: 'board_monthly',
    title: 'Reunião Mensal de Resultados com o Conselho / Diretoria',
    executiveSummary:
      'Apresentação do fechamento do 4º mês de consultoria. O projeto atingiu 68% de conclusão física e já gerou R$ 338.000 de economias validadas (ROI de 3.0x em relação aos honorários investidos). O único ponto de atenção é a liberação dos rateios pelo setor financeiro.',
    decisionsNeeded: [
      'Aprovação da nova política de bonificação trimestral para os operadores da Linha 1',
      'Determinação de prazo máximo de 5 dias para a Controladoria enviar os arquivos de conciliação de refugo',
    ],
    attendees: [
      'Dr. Roberto Fagundes (CEO)',
      'Mariana Esteves (Gerente Operações)',
      'Fernando Guimarães (Controller)',
      'Danilo Henrique (Consultor Líder)',
    ],
  },
  {
    id: 'meet-2',
    clientId: 'cli-adv-1',
    date: '2026-09-15',
    type: 'weekly_status',
    title: 'Status Report Tático Semanal (Operações & Métodos)',
    executiveSummary:
      'Alinhamento com supervisores sobre o ritual DOR matinal. Adesão atingiu 95% no Turno 1 e 88% no Turno 2.',
    decisionsNeeded: ['Substituir quadro magnético danificado no Galpão 03'],
    attendees: ['Mariana Esteves', 'Carlos Paiva', 'Danilo Henrique'],
  },
];
