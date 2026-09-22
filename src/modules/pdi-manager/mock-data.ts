import { EmployeePdi, PdiTemplate } from './types';

export const PDI_TEMPLATES: PdiTemplate[] = [
  {
    id: 'tpl-lider-turno',
    title: 'Transição: Operador II para Operador Líder de Turno',
    category: 'Liderança & Gestão Operacional',
    targetRole: 'Operador Líder de Turno',
    description: 'Desenvolvimento de competências de liderança de chão de fábrica, rituais de passagem de turno, resolução de conflitos e comunicação assertiva.',
    suggestedStrengths: [
      'Alta pontualidade e assiduidade',
      'Excelente domínio técnico da operação da linha',
      'Boa relação interpessoal com a equipe de turno'
    ],
    suggestedGaps: [
      'Pouca experiência em conduzir reuniões e rituais operacionais',
      'Dificuldade em fornecer feedbacks corretivos a colegas',
      'Visão sistêmica da linha e gargalos de produtividade'
    ],
    suggestedActions: [
      {
        title: 'Conduzir a reunião de Passagem de Turno e Kamishibai durante 3 semanas',
        pillar: '70_practice',
        skillCategory: 'Liderança & Rotina',
        deadlineDays: 45,
        mentorOrSupport: 'Danilo (Gestor de Produção)',
        evidenceCriteria: 'Registro preenchido e assinado de 15 passagens de turno sem falhas de comunicação'
      },
      {
        title: 'Facilitar uma análise de causa raiz (5 Porquês / Ishikawa) de parada de máquina',
        pillar: '70_practice',
        skillCategory: 'Melhoria Contínua & WCM',
        deadlineDays: 60,
        mentorOrSupport: 'Engenharia de Processos',
        evidenceCriteria: 'Apresentar o formulário A3 de solução na reunião semanal do setor'
      },
      {
        title: 'Sessões quinzenais de Mentoria & Shadowing com Líder Sênior de outro turno',
        pillar: '20_mentoring',
        skillCategory: 'Mentoria & Feedback',
        deadlineDays: 90,
        mentorOrSupport: 'Marcos Vinicius (Líder Turno B)',
        evidenceCriteria: '4 relatórios de aprendizados práticos validados pelo gestor'
      },
      {
        title: 'Curso de Liderança de Chão de Fábrica & Comunicação Assertiva',
        pillar: '10_courses',
        skillCategory: 'Capacitação Formal',
        deadlineDays: 30,
        mentorOrSupport: 'RH / Treinamento Interno',
        evidenceCriteria: 'Certificado de conclusão de 16h com nota mínima de 80%'
      }
    ]
  },
  {
    id: 'tpl-smed-tpm',
    title: 'Especialista em SMED (Troca Rápida) & Manutenção Autônoma',
    category: 'Eficiência Operacional & Máquina',
    targetRole: 'Preparador de Máquinas & Setup Pleno',
    description: 'Capacitação prática para redução drástica do tempo de troca de ferramentas, ajuste fino de parâmetros e zero quebras por falta de lubrificação.',
    suggestedStrengths: [
      'Cuidado rigoroso com as ferramentas de corte e moldes',
      'Atenção aos detalhes de qualidade da primeira peça (peça piloto)'
    ],
    suggestedGaps: [
      'Tempo de setup acima da média estabelecida pela engenharia',
      'Falta de padronização nas etapas internas vs. externas de setup',
      'Conhecimento básico em hidráulica e pneumática da máquina'
    ],
    suggestedActions: [
      {
        title: 'Filmar e mapear o setup da Linha Crítica, separando operações internas e externas',
        pillar: '70_practice',
        skillCategory: 'SMED & Produtividade',
        deadlineDays: 40,
        mentorOrSupport: 'Eng. Roberto (Melhoria Contínua)',
        evidenceCriteria: 'Redução comprovada de pelo menos 25% no tempo de setup da máquina'
      },
      {
        title: 'Implantar padrão LPO (Limpeza, Inspeção e Lubrificação) no posto de trabalho',
        pillar: '70_practice',
        skillCategory: 'Manutenção Autônoma TPM',
        deadlineDays: 60,
        mentorOrSupport: 'Técnico de Manutenção Mecânica',
        evidenceCriteria: 'Quadro visual de padrão LPO afixado e aprovado pelo setor de confiabilidade'
      },
      {
        title: 'Acompanhar 3 manutenções preventivas completas junto à equipe mecânica',
        pillar: '20_mentoring',
        skillCategory: 'Mentoria Técnica',
        deadlineDays: 75,
        mentorOrSupport: 'Oficina de Manutenção',
        evidenceCriteria: 'Checklist de manutenção preventiva executado em conjunto'
      },
      {
        title: 'Treinamento de Leitura e Interpretação de Desenho Técnico e Metrologia GD&T',
        pillar: '10_courses',
        skillCategory: 'Capacitação Técnica',
        deadlineDays: 45,
        mentorOrSupport: 'SENAI / Escola Interna',
        evidenceCriteria: 'Certificado de aprovação em metrologia dimensional'
      }
    ]
  },
  {
    id: 'tpl-polivalencia-operador',
    title: 'Polivalência ILUO: Operador I para Operador II Multi-postos',
    category: 'Flexibilidade de Linha',
    targetRole: 'Operador de Linha Polivalente II',
    description: 'Habilitação técnica para operar com autonomia e qualidade em pelo menos 3 postos distintos da célula de manufatura.',
    suggestedStrengths: [
      'Excelente taxa de produção no posto primário',
      'Respeito rigoroso às normas de segurança e uso de EPIs'
    ],
    suggestedGaps: [
      'Insegurança para assumir postos secundários durante ausências',
      'Dificuldade no manuseio do painel IHM da máquina secundária'
    ],
    suggestedActions: [
      {
        title: 'Operar 80 horas monitoradas no posto de Usinagem Auxiliar atingindo a cadência',
        pillar: '70_practice',
        skillCategory: 'Operação Prática',
        deadlineDays: 60,
        mentorOrSupport: 'Operador Padrão (Tutor designado)',
        evidenceCriteria: 'Atingir 98% de peças conformes sem paradas por erro operacional'
      },
      {
        title: 'Treinamento TWI de 4 passos com o multiplicador de posto da fábrica',
        pillar: '20_mentoring',
        skillCategory: 'TWI Job Instruction',
        deadlineDays: 30,
        mentorOrSupport: 'Tutor de Célula',
        evidenceCriteria: 'Validação da folha de instrução de trabalho (IT) assinada pelo tutor'
      },
      {
        title: 'Curso de Reciclagem de NR-12 (Segurança em Máquinas) e Bloqueio LOTO',
        pillar: '10_courses',
        skillCategory: 'Segurança & Compliance',
        deadlineDays: 20,
        mentorOrSupport: 'SESMT',
        evidenceCriteria: 'Certificado oficial NR-12 com pontuação máxima no teste prático'
      }
    ]
  }
];

export const INITIAL_PDIS: EmployeePdi[] = [
  {
    id: 'pdi-1',
    tenantId: 'tenant-1',
    employeeId: 'op-1',
    employeeName: 'José Carlos Nascimento',
    employeeRole: 'Operador de Célula CNC II',
    department: 'Usinagem CNC',
    shift: 'Turno A',
    currentLevel: 'Operador II (Autônomo)',
    targetRole: 'Operador Líder de Turno',
    targetLevel: 'Nível 4 TWI (Capacitador/Líder)',
    cycleYear: '2026 - 1º Ciclo',
    status: 'in_progress',
    progressPercent: 68,
    startDate: '2026-01-10',
    targetEndDate: '2026-06-30',
    careerGoal: 'Assumir a liderança técnica e de rotina do Turno A, sendo referência na passagem de turno e na mentoria dos novos operadores.',
    strengths: [
      'Domínio avançado de programação de centro de usinagem e tornos Mazak',
      'Zero acidentes de trabalho em mais de 3 anos de casa',
      'Postura ética e respeito inquestionável de todos os operadores da célula'
    ],
    growthGaps: [
      'Insegurança ao dar feedbacks corretivos em situações de queda de ritmo',
      'Necessidade de aprimorar a gestão do tempo e priorização no início do turno',
      'Comunicação em público durante reuniões gerais de segurança (DDS)'
    ],
    actions: [
      {
        id: 'act-101',
        title: 'Liderar as reuniões diárias de 5 minutos (DDS) do Turno A duas vezes por semana',
        pillar: '70_practice',
        skillCategory: 'Liderança & Comunicação',
        status: 'done',
        deadline: '2026-03-15',
        mentorOrSupport: 'Danilo (Gestor)',
        evidenceCriteria: 'Conduzir com clareza 12 reuniões de início de turno',
        completedAt: '2026-03-12',
        notes: 'Evoluiu muito na postura vocal e objetividade!'
      },
      {
        id: 'act-102',
        title: 'Mapear e documentar o procedimento padrão de substituição de ferramentas da Célula 2',
        pillar: '70_practice',
        skillCategory: 'Padronização Técnica',
        status: 'doing',
        deadline: '2026-04-30',
        mentorOrSupport: 'Engenharia Industrial',
        evidenceCriteria: 'Instrução de Trabalho (IT) aprovada e fixada no posto'
      },
      {
        id: 'act-103',
        title: 'Sessões quinzenais de Mentoria de Liderança durante os encontros 1:1',
        pillar: '20_mentoring',
        skillCategory: 'Mentoria & Carreira',
        status: 'doing',
        deadline: '2026-05-31',
        mentorOrSupport: 'Danilo (Gestor)',
        evidenceCriteria: 'Registro dos aprendizados nas atas da ferramenta Aptis 1:1'
      },
      {
        id: 'act-104',
        title: 'Curso Executivo de Liderança Operacional e Gestão de Conflitos (20h)',
        pillar: '10_courses',
        skillCategory: 'Educação Formal',
        status: 'done',
        deadline: '2026-02-28',
        mentorOrSupport: 'Plataforma Corporativa / RH',
        evidenceCriteria: 'Certificado com aproveitamento de 92%',
        completedAt: '2026-02-25'
      }
    ],
    checkIns: [
      {
        id: 'chk-1',
        pdiId: 'pdi-1',
        date: '2026-02-15',
        reviewerName: 'Danilo Henrique',
        evolutionPercent: 35,
        summary: 'Início exemplar do plano. José concluiu o módulo teórico de liderança e já começou a apoiar na condução das reuniões diárias.',
        strengthsNoticed: 'Muito engajamento e vontade de aprender. O time reagiu muito positivamente à sua participação nas reuniões de início de turno.',
        blockersAndAdjustments: 'Ajustamos o prazo da IT técnica devido à parada emergencial de máquina no início de fevereiro.',
        nextCheckInDate: '2026-03-30'
      },
      {
        id: 'chk-2',
        pdiId: 'pdi-1',
        date: '2026-03-30',
        reviewerName: 'Danilo Henrique',
        evolutionPercent: 68,
        summary: 'Check-in de meio de ciclo. José concluiu com louvor o DDS e demonstrou clareza na gestão de prioridades. Foco agora na documentação da IT.',
        strengthsNoticed: 'Autoestima em alta e comunicação muito mais firme e empática.',
        blockersAndAdjustments: 'Nenhum bloqueio. Projeto no prazo ideal para promoção no 2º semestre.',
        nextCheckInDate: '2026-05-15'
      }
    ],
    updatedAt: '2026-03-30'
  },
  {
    id: 'pdi-2',
    tenantId: 'tenant-1',
    employeeId: 'op-2',
    employeeName: 'Mariana Souza',
    employeeRole: 'Operadora de Prensa Mecânica',
    department: 'Estamparia & Prensas',
    shift: 'Turno B',
    currentLevel: 'Operadora II',
    targetRole: 'Especialista em SMED & Setup Rápido',
    targetLevel: 'Nível 3 (Autonomia Total de Troca de Moldes)',
    cycleYear: '2026 - 1º Ciclo',
    status: 'in_progress',
    progressPercent: 82,
    startDate: '2026-01-15',
    targetEndDate: '2026-05-30',
    careerGoal: 'Tornar-se a referência do turno em troca rápida de ferramentas (SMED), reduzindo o tempo de setup da prensa de 48min para 25min.',
    strengths: [
      'Agilidade motora e precisão geométrica nos ajustes',
      'Perfil investigativo e proativo em melhorias Kaizen'
    ],
    growthGaps: [
      'Dependência de apoio de eletricistas para rearmar sensores da prensa',
      'Conhecimento em diagnóstico de falhas hidráulicas simples'
    ],
    actions: [
      {
        id: 'act-201',
        title: 'Mapear e cronometrar 5 trocas de estampa na Prensa 200t com vídeo',
        pillar: '70_practice',
        skillCategory: 'SMED Prático',
        status: 'done',
        deadline: '2026-02-28',
        mentorOrSupport: 'Engenharia de Processos',
        evidenceCriteria: 'Gráfico Spaguetti e matriz de operações antes/depois',
        completedAt: '2026-02-27'
      },
      {
        id: 'act-202',
        title: 'Conduzir setup completo sem nenhuma intervenção do técnico sênior',
        pillar: '70_practice',
        skillCategory: 'Autonomia Operacional',
        status: 'done',
        deadline: '2026-03-25',
        mentorOrSupport: 'Marcos (Técnico Setup)',
        evidenceCriteria: 'Setup concluído em 26 minutos com 1ª peça 100% aprovada',
        completedAt: '2026-03-24'
      },
      {
        id: 'act-203',
        title: 'Acompanhar manutenções elétricas preventivas para aprender reset de sensores',
        pillar: '20_mentoring',
        skillCategory: 'Shadowing Elétrico',
        status: 'doing',
        deadline: '2026-04-20',
        mentorOrSupport: 'Equipe de Manutenção Elétrica',
        evidenceCriteria: 'Avaliação prática de reset seguro de barreiras ópticas NR-12'
      },
      {
        id: 'act-204',
        title: 'Curso de NR-12 em Prensas e Similares (Reciclagem Avançada)',
        pillar: '10_courses',
        skillCategory: 'Norma Regulamentadora',
        status: 'done',
        deadline: '2026-02-15',
        mentorOrSupport: 'SESMT',
        evidenceCriteria: 'Certificado de aprovação com carga de 16h',
        completedAt: '2026-02-14'
      }
    ],
    checkIns: [
      {
        id: 'chk-201',
        pdiId: 'pdi-2',
        date: '2026-03-25',
        reviewerName: 'Danilo Henrique',
        evolutionPercent: 82,
        summary: 'Mariana bateu a meta de setup em tempo recorde de 26min. Desempenho acima da expectativa!',
        strengthsNoticed: 'Dedicação impressionante e postura de liderança técnica com o operador ajudante.',
        blockersAndAdjustments: 'Falta apenas o shadowing elétrico para homologar a promoção.',
        nextCheckInDate: '2026-04-25'
      }
    ],
    updatedAt: '2026-03-25'
  },
  {
    id: 'pdi-3',
    tenantId: 'tenant-1',
    employeeId: 'op-3',
    employeeName: 'Lucas Silva',
    employeeRole: 'Operador de Torno CNC I',
    department: 'Usinagem CNC',
    shift: 'Turno A',
    currentLevel: 'Operador I (Em Formação)',
    targetRole: 'Operador de Torno CNC II',
    targetLevel: 'Nível 2 (Operação com Autonomia)',
    cycleYear: '2026 - 1º Ciclo',
    status: 'in_progress',
    progressPercent: 42,
    startDate: '2026-02-01',
    targetEndDate: '2026-07-31',
    careerGoal: 'Alcançar independência operacional total no torno CNC, corrigindo medidas no corretor de ferramentas sem necessidade de chamar o preparador.',
    strengths: [
      'Muita disposição para aprender e pontualidade exemplar',
      'Cuidado excelente com a limpeza e organização do posto (5S)'
    ],
    growthGaps: [
      'Medo de manipular os corretores de ferramentas e desgastes',
      'Leitura de tolerâncias micrométricas em paquímetro e micrômetro'
    ],
    actions: [
      {
        id: 'act-301',
        title: 'Realizar 50 medições de peças seriadas com micrômetro e registrar em carta de CEP',
        pillar: '70_practice',
        skillCategory: 'Controle de Qualidade',
        status: 'doing',
        deadline: '2026-04-30',
        mentorOrSupport: 'Inspetor de Qualidade',
        evidenceCriteria: 'Carta de controle dimensional sem dispersões de leitura'
      },
      {
        id: 'act-302',
        title: 'Treinamento prático lado a lado para ajustar corretores de raio e comprimento',
        pillar: '20_mentoring',
        skillCategory: 'Mentoria Técnica TWI',
        status: 'doing',
        deadline: '2026-05-15',
        mentorOrSupport: 'José Carlos Nascimento',
        evidenceCriteria: 'Realizar 5 compensações de desgaste de inserto com sucesso'
      },
      {
        id: 'act-303',
        title: 'Curso EAD de Metrologia e Leitura de Desenho Técnico Industrial (40h)',
        pillar: '10_courses',
        skillCategory: 'Capacitação Formal',
        status: 'todo',
        deadline: '2026-05-30',
        mentorOrSupport: 'SENAI / EAD',
        evidenceCriteria: 'Certificado de aprovação do módulo'
      }
    ],
    checkIns: [
      {
        id: 'chk-301',
        pdiId: 'pdi-3',
        date: '2026-03-10',
        reviewerName: 'Danilo Henrique',
        evolutionPercent: 42,
        summary: 'Lucas está demonstrando grande evolução nas medições. A parceria de mentoria com o José Carlos tem sido fundamental.',
        strengthsNoticed: 'Curiosidade positiva e disciplina no preenchimento das cartas de qualidade.',
        blockersAndAdjustments: 'Recomendado liberar 1h por dia na sexta-feira para adiantar o curso de metrologia.',
        nextCheckInDate: '2026-04-20'
      }
    ],
    updatedAt: '2026-03-10'
  },
  {
    id: 'pdi-4',
    tenantId: 'tenant-1',
    employeeId: 'op-4',
    employeeName: 'Carlos Eduardo Santos',
    employeeRole: 'Operador de Montagem I',
    department: 'Linha de Montagem',
    shift: 'Turno A',
    currentLevel: 'Operador I',
    targetRole: 'Operador Polivalente de Montagem II',
    targetLevel: 'Nível 3 (3 Postos Diferentes)',
    cycleYear: '2026 - 1º Ciclo',
    status: 'in_progress',
    progressPercent: 25,
    startDate: '2026-03-01',
    targetEndDate: '2026-08-31',
    careerGoal: 'Aprender a operar a bancada de testes elétricos finais e a estação de embalagem robotizada, ampliando a flexibilidade da célula.',
    strengths: [
      'Excelente velocidade na montagem mecânica dos componentes',
      'Espírito de equipe e apoio constante aos colegas'
    ],
    growthGaps: [
      'Conhecimento dos circuitos elétricos de teste',
      'Operação do braço robótico de paletização'
    ],
    actions: [
      {
        id: 'act-401',
        title: 'Treinar 40 horas operando a bancada de testes sob supervisão de tutor',
        pillar: '70_practice',
        skillCategory: 'Polivalência Prática',
        status: 'doing',
        deadline: '2026-05-30',
        mentorOrSupport: 'Juliano (Operador Sênior)',
        evidenceCriteria: 'Testar 500 produtos sem falso positivo ou falso negativo'
      },
      {
        id: 'act-402',
        title: 'Shadowing no posto de paletização para dominar procedimentos de segurança',
        pillar: '20_mentoring',
        skillCategory: 'Mentoria & Robótica',
        status: 'todo',
        deadline: '2026-06-30',
        mentorOrSupport: 'Técnico de Automação',
        evidenceCriteria: 'Comprovar destravamento e reset seguro do robô de embalagem'
      },
      {
        id: 'act-403',
        title: 'Treinamento de Segurança em Células Robotizadas (NR-12)',
        pillar: '10_courses',
        skillCategory: 'Compliance & Segurança',
        status: 'todo',
        deadline: '2026-04-15',
        mentorOrSupport: 'SESMT',
        evidenceCriteria: 'Certificado de aprovação em segurança de robôs industriais'
      }
    ],
    checkIns: [],
    updatedAt: '2026-03-01'
  }
];
