import { PowerfulQuestionPrompt, TeamMember1on1, OneOnOneMeeting } from './types';

export const POWERFUL_QUESTIONS: PowerfulQuestionPrompt[] = [
  {
    id: 'q1',
    category: 'Desafios & Bloqueios',
    question: 'O que mais te frustrou ou travou o seu trabalho na fábrica nesta última semana?',
    source: 'Andy Grove (High Output Management)',
    explanation: 'A principal função do gestor é remover impedimentos operacionais para que o liderado produza em alto rendimento.'
  },
  {
    id: 'q2',
    category: 'Feedback Bidirecional',
    question: 'Onde você sente que eu estou sendo um gargalo ou tomando muito do seu tempo?',
    source: 'Kim Scott (Radical Candor)',
    explanation: 'Incentiva a franqueza radical e demonstra vulnerabilidade, quebrando a barreira hierárquica na liderança de chão de fábrica.'
  },
  {
    id: 'q3',
    category: 'Alinhamento & Prioridades',
    question: 'Se você tivesse que focar em apenas uma única entrega prioritária esta semana, qual seria?',
    source: 'Andy Grove (High Output Management)',
    explanation: 'Ajuda o liderado a filtrar o ruído operacional e priorizar aquilo que realmente move o ponteiro da célula/turno.'
  },
  {
    id: 'q4',
    category: 'Carreira & PDI',
    question: 'Qual habilidade ou processo técnico você sente que precisa desenvolver mais nos próximos 3 meses?',
    source: 'Toyota Production System / TWI',
    explanation: 'Conecta a reunião 1:1 à Matriz de Habilidades ILUO, estimulando a polivalência e a formação de sucessores.'
  },
  {
    id: 'q5',
    category: 'Bem-Estar & Clima',
    question: 'Em uma escala de 1 a 5, como está seu nível de energia e motivação com a equipe hoje?',
    source: 'Best Places to Work Framework',
    explanation: 'Detecta precocemente riscos de burnout, atritos entre operadores ou desmotivação antes que afetem a segurança e qualidade.'
  },
  {
    id: 'q6',
    category: 'Desafios & Bloqueios',
    question: 'Se você fosse o gerente da fábrica por um dia, o que mudaria imediatamente no nosso processo?',
    source: 'Ben Horowitz (The Hard Thing About Hard Things)',
    explanation: 'Quem opera a máquina no dia a dia conhece as ineficiências ocultas melhor do que qualquer auditor ou diretor.'
  }
];

export const INITIAL_TEAM_MEMBERS: TeamMember1on1[] = [
  {
    id: 'op-1',
    name: 'José Carlos Nascimento',
    role: 'Operador Líder de Célula',
    department: 'Usinagem CNC',
    lastMeetingDate: '2026-09-15',
    meetingsCount: 4,
    averageMood: 4.5,
    openActionItemsCount: 1,
    status: 'up_to_date'
  },
  {
    id: 'op-2',
    name: 'Mariana Pires Silva',
    role: 'Preparadora de Máquinas',
    department: 'Estamparia Pesada',
    lastMeetingDate: '2026-09-02',
    meetingsCount: 2,
    averageMood: 3.0,
    openActionItemsCount: 2,
    status: 'attention'
  },
  {
    id: 'op-3',
    name: 'Lucas Ferreira Mendes',
    role: 'Operador Técnico Júnior',
    department: 'Montagem Final',
    lastMeetingDate: '2026-08-10',
    meetingsCount: 1,
    averageMood: 4.0,
    openActionItemsCount: 0,
    status: 'overdue'
  },
  {
    id: 'op-4',
    name: 'Aline Beatriz Ribeiro',
    role: 'Inspetora de Qualidade',
    department: 'Metrologia & Qualidade',
    lastMeetingDate: '2026-09-18',
    meetingsCount: 5,
    averageMood: 5.0,
    openActionItemsCount: 1,
    status: 'up_to_date'
  }
];

export const INITIAL_MEETINGS_HISTORY: OneOnOneMeeting[] = [
  {
    id: 'meet-1',
    tenantId: 'tenant-dhp',
    employeeId: 'op-1',
    employeeName: 'José Carlos Nascimento',
    employeeRole: 'Operador Líder de Célula',
    employeeDepartment: 'Usinagem CNC',
    managerName: 'Danilo Henrique',
    date: '2026-09-15',
    durationMinutes: 32,
    moodRating: 4,
    moodNote: 'Muito motivado com a nova célula, mas preocupado com o desgaste do ferramental de corte.',
    topics: [
      { id: 't1', title: 'Treinamento de novos aprendizes na CNC-04', addedBy: 'manager', isDiscussed: true },
      { id: 't2', title: 'Falta de pastilhas de reposição no almoxarifado', addedBy: 'employee', isDiscussed: true },
      { id: 't3', title: 'Plano para assumir tutoria de polivalência', addedBy: 'manager', isDiscussed: true }
    ],
    actionItems: [
      {
        id: 'act-1',
        title: 'Alinhar com Compras a chegada do lote emergencial de pastilhas',
        assignee: 'manager',
        assigneeName: 'Danilo Henrique',
        dueDate: '2026-09-18',
        status: 'completed'
      },
      {
        id: 'act-2',
        title: 'Estruturar roteiro prático para treinar o operador substituto da tarde',
        assignee: 'employee',
        assigneeName: 'José Carlos',
        dueDate: '2026-09-22',
        status: 'pending'
      }
    ],
    transcripts: [
      {
        id: 'tr-1',
        speaker: 'manager',
        speakerName: 'Danilo (Gestor)',
        timestamp: '00:15',
        text: 'E aí José, tudo bom? Como foi a semana na célula CNC? Sentiu alguma dificuldade com o novo turno?'
      },
      {
        id: 'tr-2',
        speaker: 'employee',
        speakerName: 'José Carlos',
        timestamp: '00:45',
        text: 'Fala Danilo! No geral foi bem positivo, a produção bateu a meta, mas estamos ficando sem pastilhas de corte no armário e isso me preocupa se entrar lote extra.'
      },
      {
        id: 'tr-3',
        speaker: 'manager',
        speakerName: 'Danilo (Gestor)',
        timestamp: '01:20',
        text: 'Entendido. Eu vou puxar esse chamado direto com Suprimentos hoje mesmo para não deixar você na mão.'
      }
    ],
    notes: 'José está performando com alta liderança natural. Pronto para transicionar para tutor nível O na Matriz ILUO.',
    createdAt: '2026-09-15T10:30:00Z'
  }
];
