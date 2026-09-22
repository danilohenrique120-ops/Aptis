import { KaizenProject, KaizenLevel } from './types';

export const KAIZEN_LEVEL_CONFIG: Record<KaizenLevel, {
  label: string;
  badgeClass: string;
  borderClass: string;
  icon: string;
  description: string;
  points: number;
  timeframe: string;
}> = {
  quick: {
    label: 'Quick Kaizen',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderClass: 'border-amber-400',
    icon: '⚡',
    description: 'Melhoria pontual rápida no posto, sem investimento de capital (1 a 3 dias).',
    points: 10,
    timeframe: '1 a 3 dias'
  },
  standard: {
    label: 'Standard Kaizen',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    borderClass: 'border-blue-400',
    icon: '🛠️',
    description: 'Melhoria de célula ou linha conduzida pela equipe de turno com suporte técnico (1 a 2 semanas).',
    points: 25,
    timeframe: '1 a 2 semanas'
  },
  major: {
    label: 'Major Kaizen',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    borderClass: 'border-purple-400',
    icon: '🏭',
    description: 'Projeto multidisciplinar de alto impacto para eliminar desperdícios crônicos (1 a 2 meses).',
    points: 50,
    timeframe: '1 a 2 meses'
  },
  advanced: {
    label: 'Advanced Kaizen',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    borderClass: 'border-rose-400',
    icon: '🔬',
    description: 'Kaizen estratégico de engenharia, automação, redesign de fluxo ou digitalização de processo.',
    points: 100,
    timeframe: '2 a 4 meses'
  }
};

export const INITIAL_KAIZEN_PROJECTS: KaizenProject[] = [
  {
    id: 'kz-1',
    tenantId: 'tenant-1',
    title: 'Dispositivo Poka-Yoke contra inversão de chapas na Prensa 04',
    level: 'quick',
    category: 'qualidade',
    stage: 'standardized',
    sector: 'Estamparia & Prensas',
    area: 'Linha de Estampagem 02',
    leaderName: 'Aline Ferreira',
    leaderRole: 'Operadora de Prensa Especialista',
    teamMembers: ['Mariana Souza', 'Carlos Silveira'],
    estimatedSavingsAnnual: 42000,
    hoursSavedMonthly: 18,
    createdAt: '2026-07-15',
    completedAt: '2026-07-18',
    a3: {
      background: 'A Prensa 04 processa chapas de 2mm com chanfros assimétricos para o cliente automotivo Alfa.',
      problemStatement: 'Em junho/2026, 142 peças foram refugadas porque operadores inverteram o lado de alimentação da chapa, gerando refugo de R$ 3.500/mês.',
      currentCondition: 'Operação dependia 100% da atenção visual do operador em um ciclo de 12 segundos por batida.',
      fiveWhys: {
        why1: 'Por que peças com furos invertidos saíram da linha? Porque o operador colocou a chapa ao contrário.',
        why2: 'Por que colocou ao contrário? Porque visualmente as duas extremidades da chapa são muito parecidas.',
        why3: 'Por que não havia conferência? Porque a cadência de batida é rápida e não havia bloqueio físico.',
        why4: 'Por que o molde permitia a posição errada? Porque o gabarito original foi desenhado sem pino guia assimétrico.',
        why5: 'Por que não foi corrigido antes? Porque era tratado como "erro humano de atenção".',
        rootCause: 'Inexistência de barreira mecânica à prova de erros (Poka-Yoke) no berço da matriz.'
      },
      targetCondition: 'Eliminar 100% dos erros de posicionamento da chapa por impossibilidade física de fechamento incorreto.',
      targetKpiGoal: 'Zero peças refugadas por montagem invertida (Zero Defeitos PPM).',
      actionPlan: [
        { id: 'act-1', what: 'Usinar pino guia de 8mm no berço da matriz', who: 'Ferramentaria (Marcão)', when: '2026-07-16', status: 'done' },
        { id: 'act-2', what: 'Fazer teste piloto com 50 peças', who: 'Aline Ferreira', when: '2026-07-17', status: 'done' },
        { id: 'act-3', what: 'Fixar e pintar de amarelo o pino no gabarito', who: 'Manutenção', when: '2026-07-18', status: 'done' }
      ],
      verificationResults: 'Após 60 dias de produção contínua (> 18.000 peças), nenhuma peça foi invertida. Refugo zerado.',
      savingsAnnual: 42000,
      hoursSavedMonthly: 18,
      isTargetAchieved: true,
      standardizationSummary: 'Instrução de Trabalho IT-EST-04 atualizada e matriz de habilidades com registro do Poka-Yoke.',
      skillsMatrixUpdated: true,
      lessonsLearned: 'Poka-yoke mecânico de R$ 150 economizou mais de R$ 40 mil por ano em retrabalho.'
    }
  },
  {
    id: 'kz-2',
    tenantId: 'tenant-1',
    title: 'Redução de Setup SMED no Torno Mazak CNC (de 48min para 22min)',
    level: 'standard',
    category: 'produtividade',
    stage: 'standardized',
    sector: 'Usinagem CNC',
    area: 'Célula de Usinagem 01',
    leaderName: 'José Carlos Nascimento',
    leaderRole: 'Operador Líder de Turno',
    teamMembers: ['Lucas Silva', 'Danilo Henrique', 'Engenharia de Processos'],
    estimatedSavingsAnnual: 68000,
    hoursSavedMonthly: 32,
    createdAt: '2026-08-01',
    completedAt: '2026-08-16',
    a3: {
      background: 'Célula de tornos CNC opera com 4 trocas de lote diárias para atender pedidos Just-in-Time.',
      problemStatement: 'Tempo médio de setup era de 48 minutos, mantendo o torno parado 3,2 horas por dia com perda de OEE.',
      currentCondition: 'Operadores procuravam chaves allen, pastilhas e programas com a máquina desligada (setup interno).',
      fiveWhys: {
        why1: 'Por que o torno ficava 48min parado? Porque o preparador saía da máquina para buscar ferramentas.',
        why2: 'Por que saía da máquina? Porque o armário central de ferramentas fica a 45 metros de distância.',
        why3: 'Por que não trazia antes? Porque não havia kit pré-ajustado por ordem de produção.',
        why4: 'Por que não havia kit? Porque não existia carrinho padrão com ferramentas pré-zeradas em presetter.',
        why5: 'Por que não usavam presetter? Porque o procedimento operacional misturava setup interno com externo.',
        rootCause: 'Falta de segregação entre operações de setup externo (com máquina rodando) e setup interno (parada).'
      },
      targetCondition: 'Reduzir o tempo de máquina parada para menos de 25 minutos através do método SMED Shingo.',
      targetKpiGoal: 'Tempo de troca menor que 25 min com liberação de primeira peça na 1ª tentativa.',
      actionPlan: [
        { id: 'act-21', what: 'Filmar e cronometrar o setup atual com gráfico de Espaguete', who: 'Lucas Silva', when: '2026-08-04', status: 'done' },
        { id: 'act-22', what: 'Implantar carrinho sombra com ferramentas dedicadas ao lado do Mazak', who: 'José Carlos Nascimento', when: '2026-08-08', status: 'done' },
        { id: 'act-23', what: 'Pré-carregar programas no pendrive/rede antes do término do lote anterior', who: 'Programação CNC', when: '2026-08-12', status: 'done' },
        { id: 'act-24', what: 'Auditar 5 trocas cronometradas com o turno da noite', who: 'Danilo Henrique', when: '2026-08-15', status: 'done' }
      ],
      verificationResults: 'Tempo médio de setup caiu para 21min e 40s (redução de 55%). Ganho de 1,8h a mais de usinagem por dia.',
      savingsAnnual: 68000,
      hoursSavedMonthly: 32,
      isTargetAchieved: true,
      standardizationSummary: 'Criado o POP-CNC-08 (Setup Rápido SMED) e treinado 100% dos operadores do Turno A e B.',
      skillsMatrixUpdated: true,
      lessonsLearned: 'Transformar passos internos em externos elimina paradas sem necessidade de comprar máquinas novas.'
    }
  },
  {
    id: 'kz-3',
    tenantId: 'tenant-1',
    title: 'Recuperação & Filtragem Contínua de Óleo Solúvel e Cavacos',
    level: 'major',
    category: 'custo',
    stage: 'implementation',
    sector: 'Manutenção & Ferramentaria',
    area: 'Oficina Central & Galpão de Sucata',
    leaderName: 'Carlos Silveira',
    leaderRole: 'Supervisor de Manutenção',
    teamMembers: ['José Carlos Nascimento', 'Rodrigo Santoro', 'Técnico de Confiabilidade'],
    estimatedSavingsAnnual: 95000,
    hoursSavedMonthly: 20,
    createdAt: '2026-08-10',
    a3: {
      background: 'Fábrica consome 1.200 litros de óleo solúvel por mês para refrigeração de ferramentas de corte.',
      problemStatement: 'Descarte de cavacos úmidos causava desperdício de R$ 9.800/mês em óleo emulsionado não recuperado.',
      currentCondition: 'Cavacos eram colocados em caçambas abertas e o fluido escorria para a canaleta sem reaproveitamento.',
      fiveWhys: {
        why1: 'Por que gastamos tanto óleo novo? Porque 60% do fluido sai preso nos cavacos descartados.',
        why2: 'Por que o cavaco sai encharcado? Porque a esteira extratora não tem centrifugação.',
        why3: 'Por que não há centrífuga? Porque nunca foi instalado um sistema de desoleamento.',
        why4: 'Por que não foi instalado? Porque faltava um estudo de payback comprovando o retorno do investimento.',
        why5: 'Por que não fizeram o payback? Porque o custo do óleo era diluído em custos gerais da fábrica.',
        rootCause: 'Falta de circuito fechado de drenagem e decantação de fluido de usinagem.'
      },
      targetCondition: 'Recuperar pelo menos 65% do óleo solúvel dos cavacos e recircular após filtragem magnética.',
      targetKpiGoal: 'Reduzir compra de óleo solúvel em R$ 8.000/mês e atender requisitos ambientais ISO 14001.',
      actionPlan: [
        { id: 'act-31', what: 'Projetar calha coletora com filtro magnético no fundo das caçambas', who: 'Eng. Confiabilidade', when: '2026-08-20', status: 'done' },
        { id: 'act-32', what: 'Instalar bomba de recalque e tanque decantador de 500L', who: 'Carlos Silveira', when: '2026-09-05', status: 'done' },
        { id: 'act-33', what: 'Aferir concentração com refratômetro antes de devolver à linha', who: 'Rodrigo Santoro', when: '2026-09-25', status: 'doing' }
      ],
      verificationResults: 'Primeiro mês de teste reduziu a compra de óleo em 48%. Meta em fase final de consolidação.',
      savingsAnnual: 95000,
      hoursSavedMonthly: 20,
      isTargetAchieved: false,
      standardizationSummary: 'Elaboração do padrão de monitoramento diário de pH e concentração Brix.',
      skillsMatrixUpdated: false,
      lessonsLearned: 'Sustentabilidade ecológica gera economia financeira direta para a fábrica.'
    }
  },
  {
    id: 'kz-4',
    tenantId: 'tenant-1',
    title: 'Automação Robotizada com Câmera IA de Inspeção Dimensional na Montagem',
    level: 'advanced',
    category: 'qualidade',
    stage: 'analysis',
    sector: 'Linha de Montagem',
    area: 'Célula Robotizada 03',
    leaderName: 'Juliano Ribeiro',
    leaderRole: 'Engenheiro de Automação & Processos',
    teamMembers: ['Carlos Eduardo Santos', 'Mariana Souza', 'Lucas Silva'],
    estimatedSavingsAnnual: 180000,
    hoursSavedMonthly: 60,
    createdAt: '2026-08-25',
    a3: {
      background: 'A linha de montagem final expede 3.500 conjuntos por dia para clientes tier-1.',
      problemStatement: 'Inspeção por amostragem manual deixava passar microfissuras e pinos fora de tolerância (3 reclamações de cliente no ano).',
      currentCondition: 'Operador gastava 25 segundos medindo com paquímetro 1 peça a cada 50 produzidas.',
      fiveWhys: {
        why1: 'Por que defeitos chegaram ao cliente? Porque o controle por amostragem não pega desvios aleatórios.',
        why2: 'Por que não mede 100% das peças? Porque a medição manual de 100% travaria o fluxo e exigiria 3 operadores a mais.',
        why3: 'Por que a máquina não inspeciona sozinha? Porque o posto não possui sensor de visão computacional integrado.',
        why4: 'Por que não tinha sensor de visão? Porque as tecnologias antigas eram complexas de programar na fábrica.',
        why5: 'Por que é viável agora? Porque sistemas de visão com IA identificam defeitos submilimétricos em 0,4 segundos.',
        rootCause: 'Processo de garantia de qualidade dependente de inspeção humana com cobertura amostral insuficiente.'
      },
      targetCondition: 'Inspeção 100% automática em linha via sistema de visão com rejeição imediata de não conformes.',
      targetKpiGoal: 'Zero reclamações externas e liberação de 60 horas/mês de tempo de operador.',
      actionPlan: [
        { id: 'act-41', what: 'Estudo de viabilidade de hardware de visão computacional Cognex/Keyence', who: 'Juliano Ribeiro', when: '2026-09-15', status: 'done' },
        { id: 'act-42', what: 'Montagem de bancada de teste piloto com peças boas e com defeito', who: 'Carlos Eduardo Santos', when: '2026-10-05', status: 'doing' },
        { id: 'act-43', what: 'Integração do PLC da linha com o semáforo de rejeição', who: 'Automação', when: '2026-10-25', status: 'todo' }
      ],
      verificationResults: 'Em fase de análise e piloto de bancada. Taxa de detecção no piloto alcançou 99,8%.',
      savingsAnnual: 180000,
      hoursSavedMonthly: 60,
      isTargetAchieved: false,
      standardizationSummary: 'Padrão será formalizado após homologação com cliente.',
      skillsMatrixUpdated: false,
      lessonsLearned: 'Inspeção automática no posto evita o custo exponencial de recall ou retrabalho no cliente.'
    }
  },
  {
    id: 'kz-5',
    tenantId: 'tenant-1',
    title: 'Mesa pantográfica de elevação ergonômica para embalagem de caixas pesadas',
    level: 'quick',
    category: 'ergonomia',
    stage: 'standardized',
    sector: 'Logística & Expedição',
    area: 'Posto de Paletização',
    leaderName: 'Marcos Vinicius',
    leaderRole: 'Operador de Expedição Sênior',
    teamMembers: ['Juliano Ribeiro', 'SESMT'],
    estimatedSavingsAnnual: 18000,
    hoursSavedMonthly: 24,
    createdAt: '2026-07-20',
    completedAt: '2026-07-24',
    a3: {
      background: 'Operadores empilhavam manualmente até 180 caixas de 22kg por turno em pallets de madeira.',
      problemStatement: 'Queixas frequentes de lombalgia e 2 afastamentos médicos registrados no setor nos últimos 12 meses.',
      currentCondition: 'Operador precisava dobrar a coluna até 30cm do chão para posicionar a primeira camada de caixas.',
      fiveWhys: {
        why1: 'Por que havia queixa lombar? Porque o operador se curvava mais de 200 vezes por turno.',
        why2: 'Por que se curvava? Porque o pallet ficava direto no piso da fábrica.',
        why3: 'Por que não estava elevado? Porque não havia dispositivo de altura regulável.',
        why4: 'Por que não tinha elevador? Porque a área foi adaptada provisoriamente e nunca foi revisada pela ergonomia.',
        why5: 'Por que não chamaram o SESMT? Porque os operadores consideravam a dor "normal do trabalho pesado".',
        rootCause: 'Inexistência de regulagem de altura na zona de pega de cargas pesadas.'
      },
      targetCondition: 'Manter a zona de trabalho sempre entre a altura do joelho e cotovelo do operador (NR-17).',
      targetKpiGoal: 'Zero queixas de dores posturais no check-in diário e redução do cansaço no fim de turno.',
      actionPlan: [
        { id: 'act-51', what: 'Reaproveitar mesa pantográfica ociosa do galpão de ferramentaria', who: 'Marcos Vinicius', when: '2026-07-21', status: 'done' },
        { id: 'act-52', what: 'Instalar acionamento pneumático de pedal com trava de fim de curso', who: 'Manutenção', when: '2026-07-22', status: 'done' },
        { id: 'act-53', what: 'Validar laudo ergonômico com médico do trabalho', who: 'SESMT', when: '2026-07-24', status: 'done' }
      ],
      verificationResults: 'Aderência de 100% dos operadores. Zero queixas registradas nos últimos 60 dias.',
      savingsAnnual: 18000,
      hoursSavedMonthly: 24,
      isTargetAchieved: true,
      standardizationSummary: 'Homologado no catálogo de boas práticas ergonômicas da planta.',
      skillsMatrixUpdated: true,
      lessonsLearned: 'Ajustes mecânicos simples de ergonomia evitam passivos trabalhistas graves.'
    }
  },
  {
    id: 'kz-6',
    tenantId: 'tenant-1',
    title: 'Quadro Visual de Travamento LOTO e Identificação de Disjuntores Críticos',
    level: 'quick',
    category: 'segurança',
    stage: 'ideation',
    sector: 'Manutenção & Ferramentaria',
    area: 'Subestação & Painéis de Força',
    leaderName: 'Rodrigo Santoro',
    leaderRole: 'Operador de Montagem',
    teamMembers: ['Carlos Silveira', 'SESMT'],
    estimatedSavingsAnnual: 5000,
    hoursSavedMonthly: 8,
    createdAt: '2026-09-02',
    a3: {
      background: 'Manutenção em máquinas exige bloqueio e etiquetagem obrigatória de fontes de energia (NR-10 e NR-12).',
      problemStatement: 'Operadores levavam até 15 minutos procurando a chave e cadeado corretos para cada painel específico.',
      currentCondition: 'Cadeados e garras ficavam guardados em caixa de ferramentas desorganizada.',
      fiveWhys: {
        why1: 'Por que o bloqueio demorava? Porque os cadeados não tinham identificação visual por máquina.',
        why2: 'Por que não tinham? Porque cada técnico comprou em momentos diferentes.',
        why3: 'Por que não há padrão? Porque faltava um quadro centralizado com sombra de ferramentas LOTO.',
        why4: 'Por que não fizeram? Porque a equipe priorizava chamados corretivos.',
        why5: 'Por que é crítico? Porque a pressa pode levar a desrespeitar o travamento seguro.',
        rootCause: 'Desorganização visual dos dispositivos de bloqueio de energia perigosa.'
      },
      targetCondition: 'Quadro visual 5S LOTO com garras, cadeados codificados por cor e etiquetas nominais.',
      targetKpiGoal: 'Tempo de travamento seguro menor que 3 minutos.',
      actionPlan: [
        { id: 'act-61', what: 'Confeccionar quadro acrílico com identificação fotográfica dos disjuntores', who: 'Rodrigo Santoro', when: '2026-09-18', status: 'todo' },
        { id: 'act-62', what: 'Padronizar chaves mestras e numerar cadeados', who: 'Carlos Silveira', when: '2026-09-22', status: 'todo' }
      ],
      verificationResults: 'Em fase de aprovação com o SESMT.',
      savingsAnnual: 5000,
      hoursSavedMonthly: 8,
      isTargetAchieved: false,
      standardizationSummary: 'Será incorporado ao procedimento geral de segurança da planta.',
      skillsMatrixUpdated: false,
      lessonsLearned: 'Segurança rápida e visual incentiva a cultura preventiva de toda a equipe.'
    }
  }
];

export const SECTORS_LIST = [
  'Usinagem CNC',
  'Estamparia & Prensas',
  'Linha de Montagem',
  'Manutenção & Ferramentaria',
  'Logística & Expedição',
  'Pintura Industrial'
];
