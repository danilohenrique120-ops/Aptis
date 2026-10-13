import { ColumnDefinition } from '@/components/common/SmartExcelImporterModal';

export interface ToolExcelConfig {
  toolId: string;
  toolTitle: string;
  subtitle: string;
  templateFilename: string;
  columns: ColumnDefinition[];
  sampleRows: Record<string, any>[];
}

export const EXCEL_IMPORT_CONFIGS: Record<string, ToolExcelConfig> = {
  // 1. Aptis Skills (Matriz de Habilidades ILUO)
  'skills-matrix': {
    toolId: 'skills-matrix',
    toolTitle: 'Aptis Skills',
    subtitle: 'Importe colaboradores, postos e notas ILUO (1-Aprendiz, 2-Prática, 3-Autônomo, 4-Tutor)',
    templateFilename: 'aptis_skills_modelo.xlsx',
    columns: [
      {
        key: 'employeeName',
        label: 'Nome do Operador',
        required: true,
        example: 'Marcos Vinicius',
        description: 'Nome completo do colaborador',
        synonyms: ['nome', 'operador', 'colaborador', 'funcionario', 'nome completo']
      },
      {
        key: 'employeeId',
        label: 'Matrícula',
        required: false,
        example: 'OP-1042',
        description: 'Código de matrícula ou crachá (opcional)',
        synonyms: ['matricula', 're', 'id', 'codigo', 'cracha']
      },
      {
        key: 'sector',
        label: 'Setor',
        required: true,
        example: 'Usinagem CNC',
        description: 'Setor ou célula de atuação',
        synonyms: ['area', 'setor', 'departamento', 'celula', 'linha']
      },
      {
        key: 'role',
        label: 'Cargo',
        required: true,
        example: 'Operador Especialista CNC',
        description: 'Função ou cargo formal',
        synonyms: ['funcao', 'cargo', 'posicao', 'ocupacao']
      },
      {
        key: 'shift',
        label: 'Turno',
        required: false,
        example: 'Turno A',
        description: 'Turno de trabalho (Turno A, Turno B, Turno C ou 1º/2º/3º)',
        synonyms: ['turno', 'horario', 'escala']
      },
      {
        key: 'station',
        label: 'Posto de Trabalho',
        required: false,
        example: 'Torno CNC 4 Eixos',
        description: 'Nome do posto ou máquina que o operador atua',
        synonyms: ['posto', 'maquina', 'estacao', 'equipamento', 'posto de trabalho']
      },
      {
        key: 'level',
        label: 'Nivel ILUO',
        required: false,
        example: '3',
        description: 'Nível ILUO: 1 (ou I), 2 (ou L), 3 (ou U) ou 4 (ou O)',
        synonyms: ['nivel', 'iluo', 'nota', 'grau', 'habilidade', 'status iluo']
      }
    ],
    sampleRows: [
      {
        employeeName: 'Carlos Eduardo Silveira',
        employeeId: 'OP-1001',
        sector: 'Usinagem CNC',
        role: 'Operador CNC Sênior',
        shift: 'Turno A',
        station: 'Torno CNC 4 Eixos',
        level: '4'
      },
      {
        employeeName: 'Juliana Mendes',
        employeeId: 'OP-1002',
        sector: 'Usinagem CNC',
        role: 'Operadora CNC Pleno',
        shift: 'Turno A',
        station: 'Centro de Usinagem Vertical',
        level: '3'
      },
      {
        employeeName: 'Ricardo Oliveira',
        employeeId: 'OP-1003',
        sector: 'Estamparia & Prensas',
        role: 'Preparador de Prensa',
        shift: 'Turno B',
        station: 'Prensa Hidráulica 200T',
        level: '2'
      }
    ]
  },

  // 2. Aptis Routine (Tarefas e Rotinas do Gestor)
  'manager-tasks': {
    toolId: 'manager-tasks',
    toolTitle: 'Aptis Routine',
    subtitle: 'Importe plano de ação, tarefas pendentes e rituais operacionais',
    templateFilename: 'aptis_routine_tarefas.xlsx',
    columns: [
      {
        key: 'title',
        label: 'Titulo da Tarefa',
        required: true,
        example: 'Auditar parada de linha na Célula 03',
        description: 'Ação objetiva a ser executada',
        synonyms: ['titulo', 'tarefa', 'acao', 'atividade', 'descricao curta']
      },
      {
        key: 'sector',
        label: 'Setor',
        required: true,
        example: 'Usinagem CNC',
        description: 'Setor da fábrica relacionado',
        synonyms: ['setor', 'area', 'departamento', 'linha']
      },
      {
        key: 'priority',
        label: 'Prioridade',
        required: false,
        example: 'Alta',
        description: 'Baixa, Media, Alta ou Critica',
        synonyms: ['prioridade', 'urgencia', 'criticidade']
      },
      {
        key: 'status',
        label: 'Status',
        required: false,
        example: 'A Fazer',
        description: 'A Fazer, Em Andamento ou Concluido',
        synonyms: ['status', 'estado', 'situacao', 'fase']
      },
      {
        key: 'assignee',
        label: 'Responsavel',
        required: false,
        example: 'Carlos Silveira',
        description: 'Pessoa designada para a tarefa',
        synonyms: ['responsavel', 'dono', 'executor', 'quem']
      },
      {
        key: 'dueDate',
        label: 'Prazo',
        required: false,
        example: '2026-10-25',
        description: 'Data de vencimento (Formato AAAA-MM-DD ou DD/MM/AAAA)',
        synonyms: ['prazo', 'data', 'vencimento', 'limite', 'data limite']
      },
      {
        key: 'description',
        label: 'Descricao',
        required: false,
        example: 'Investigar aquecimento anômalo no mancal',
        description: 'Detalhes ou instruções da atividade',
        synonyms: ['descricao', 'detalhes', 'observacao', 'notas']
      }
    ],
    sampleRows: [
      {
        title: 'Verificar alinhamento da esteira 02',
        sector: 'Usinagem CNC',
        priority: 'Alta',
        status: 'A Fazer',
        assignee: 'Carlos Silveira',
        dueDate: '2026-10-20',
        description: 'Revisão periódica do mancal após troca de correia'
      },
      {
        title: 'Checklist 5S de bancadas de solda',
        sector: 'Montagem & Solda',
        priority: 'Media',
        status: 'A Fazer',
        assignee: 'Mariana Souza',
        dueDate: '2026-10-22',
        description: 'Garantir organização dos gabaritos de soldagem'
      }
    ]
  },

  // 3. Aptis Compliance (Matriz de Treinamentos NRs & POPs)
  'training-matrix': {
    toolId: 'training-matrix',
    toolTitle: 'Aptis Compliance',
    subtitle: 'Importe registros de treinamentos de NRs e POPs operacionais',
    templateFilename: 'aptis_compliance_treinamentos.xlsx',
    columns: [
      {
        key: 'employeeName',
        label: 'Nome do Colaborador',
        required: true,
        example: 'Carlos Silveira',
        description: 'Nome completo do funcionário treinado',
        synonyms: ['colaborador', 'nome', 'funcionario', 'aluno', 'participante']
      },
      {
        key: 'employeeRole',
        label: 'Cargo',
        required: true,
        example: 'Eletricista de Manutenção',
        description: 'Função do colaborador',
        synonyms: ['cargo', 'funcao', 'posicao']
      },
      {
        key: 'department',
        label: 'Departamento',
        required: true,
        example: 'Usinagem CNC',
        description: 'Área ou setor do colaborador',
        synonyms: ['departamento', 'setor', 'area', 'linha']
      },
      {
        key: 'code',
        label: 'Codigo da Norma ou POP',
        required: true,
        example: 'NR-10',
        description: 'Código da norma (ex: NR-10, NR-12, NR-35, POP-001)',
        synonyms: ['norma', 'codigo', 'nr', 'pop', 'sigla', 'curso']
      },
      {
        key: 'type',
        label: 'Tipo',
        required: false,
        example: 'NR',
        description: 'NR (Norma Regulamentadora) ou POP (Procedimento Padrão)',
        synonyms: ['tipo', 'categoria', 'classificacao']
      },
      {
        key: 'completedDate',
        label: 'Data de Conclusao',
        required: false,
        example: '2025-04-10',
        description: 'Data do certificado (AAAA-MM-DD ou DD/MM/AAAA)',
        synonyms: ['data', 'data realizacao', 'conclusao', 'emissao']
      },
      {
        key: 'validityMonths',
        label: 'Validade em Meses',
        required: false,
        example: '24',
        description: 'Validade legal em meses (ex: 12, 24)',
        synonyms: ['validade', 'meses', 'periodo', 'vigencia']
      },
      {
        key: 'instructorOrEntity',
        label: 'Instrutor ou Entidade',
        required: false,
        example: 'SENAI CETEQ',
        description: 'Nome do instrutor técnico ou escola certificadora',
        synonyms: ['instrutor', 'entidade', 'escola', 'empresa treinadora']
      }
    ],
    sampleRows: [
      {
        employeeName: 'Carlos Silveira',
        employeeRole: 'Eletricista de Manutenção',
        department: 'Usinagem CNC',
        code: 'NR-10',
        type: 'NR',
        completedDate: '2025-04-10',
        validityMonths: '24',
        instructorOrEntity: 'Eng. Marcelo Dias (CREA 50698124)'
      },
      {
        employeeName: 'Mariana Souza',
        employeeRole: 'Supervisora de Turno',
        department: 'Estamparia & Prensas',
        code: 'NR-12',
        type: 'NR',
        completedDate: '2025-06-15',
        validityMonths: '24',
        instructorOrEntity: 'SENAI Indústria'
      }
    ]
  },

  // 4. Aptis Kaizen (Gestão de Melhoria Contínua)
  'kaizen-manager': {
    toolId: 'kaizen-manager',
    toolTitle: 'Aptis Kaizen',
    subtitle: 'Importe ideias de melhoria contínua, reduções de custo e projetos A3',
    templateFilename: 'aptis_kaizen_ideias.xlsx',
    columns: [
      {
        key: 'title',
        label: 'Titulo da Ideia',
        required: true,
        example: 'Eliminação de vazamento pneumático na prensagem',
        description: 'Descrição objetiva da melhoria',
        synonyms: ['titulo', 'ideia', 'kaizen', 'projeto', 'nome da ideia']
      },
      {
        key: 'author',
        label: 'Autor',
        required: true,
        example: 'Roberto Lima',
        description: 'Operador ou líder proponente',
        synonyms: ['autor', 'criador', 'colaborador', 'proponente']
      },
      {
        key: 'sector',
        label: 'Setor',
        required: true,
        example: 'Estamparia & Prensas',
        description: 'Setor onde o Kaizen será aplicado',
        synonyms: ['setor', 'area', 'linha', 'local']
      },
      {
        key: 'category',
        label: 'Categoria',
        required: false,
        example: 'Custo',
        description: 'Seguranca, Qualidade, Custo, Ergonomia ou Moral',
        synonyms: ['categoria', 'tipo', 'pilar', 'foco']
      },
      {
        key: 'stage',
        label: 'Estagio',
        required: false,
        example: 'Ideação',
        description: 'Ideacao, Analise, Implementacao ou Concluido',
        synonyms: ['estagio', 'etapa', 'status', 'fase']
      },
      {
        key: 'impactValue',
        label: 'Economia Estimada R$',
        required: false,
        example: '14500',
        description: 'Ganho financeiro anual estimado em Reais',
        synonyms: ['ganho', 'economia', 'impacto financeiro', 'valor', 'reais', 'r$']
      },
      {
        key: 'description',
        label: 'Descricao do Problema e Solucao',
        required: false,
        example: 'Substituição de engate rápido padrão por modelo vedado',
        description: 'Detalhamento da causa e ação',
        synonyms: ['descricao', 'detalhes', 'solucao', 'proposta']
      }
    ],
    sampleRows: [
      {
        title: 'Instalação de sensor de fim de curso óptico',
        author: 'Marcos Vinicius',
        sector: 'Usinagem CNC',
        category: 'Qualidade',
        stage: 'Implementação',
        impactValue: '8500',
        description: 'Evita que a ferramenta colida com a peça durante o avanço rápido'
      },
      {
        title: 'Suporte ergonômico para pistola de aperto',
        author: 'Aline Ferreira',
        sector: 'Montagem & Solda',
        category: 'Ergonomia',
        stage: 'Concluído',
        impactValue: '3000',
        description: 'Balanceador com mola reduz esforço repetitivo do punho'
      }
    ]
  },

  // 5. Aptis PDI (Plano de Desenvolvimento Individual)
  'pdi-manager': {
    toolId: 'pdi-manager',
    toolTitle: 'Aptis PDI',
    subtitle: 'Importe metas 70-20-10 e planos de desenvolvimento dos colaboradores',
    templateFilename: 'aptis_pdi_desenvolvimento.xlsx',
    columns: [
      {
        key: 'employeeName',
        label: 'Nome do Colaborador',
        required: true,
        example: 'Lucas Andrade',
        description: 'Nome completo do colaborador',
        synonyms: ['colaborador', 'nome', 'funcionario', 'profissional']
      },
      {
        key: 'role',
        label: 'Cargo Atual',
        required: true,
        example: 'Auxiliar de Usinagem',
        description: 'Cargo que ocupa hoje',
        synonyms: ['cargo atual', 'cargo', 'funcao atual', 'funcao']
      },
      {
        key: 'sector',
        label: 'Setor',
        required: true,
        example: 'Usinagem CNC',
        description: 'Área da fábrica',
        synonyms: ['setor', 'area', 'departamento']
      },
      {
        key: 'targetRole',
        label: 'Objetivo de Carreira',
        required: false,
        example: 'Operador CNC Júnior',
        description: 'Cargo almejado no plano',
        synonyms: ['objetivo', 'meta', 'cargo alvo', 'proximo nivel']
      },
      {
        key: 'focusSkill',
        label: 'Competencia Foco',
        required: false,
        example: 'Interpretação de Desenho e Tolerância GD&T',
        description: 'Competência prioritária para desenvolvimento',
        synonyms: ['competencia', 'foco', 'gap', 'habilidade']
      },
      {
        key: 'action70',
        label: 'Acao 70% (Pratica Fabril)',
        required: false,
        example: 'Acompanhar 20 setups de ferramentas com o preparador sênior',
        description: 'Prática na linha (70%)',
        synonyms: ['70%', 'acao 70', 'pratica', 'on the job']
      },
      {
        key: 'action20',
        label: 'Acao 20% (Mentoria)',
        required: false,
        example: 'Sessão quinzenal de feedback técnico com o líder',
        description: 'Troca e mentoria (20%)',
        synonyms: ['20%', 'acao 20', 'mentoria', 'troca']
      },
      {
        key: 'action10',
        label: 'Acao 10% (Cursos/Normas)',
        required: false,
        example: 'Treinamento online de Leitura e Interpretação de Desenho Técnico',
        description: 'Curso ou capacitação formal (10%)',
        synonyms: ['10%', 'acao 10', 'curso', 'treinamento formal']
      }
    ],
    sampleRows: [
      {
        employeeName: 'Felipe Alencar',
        role: 'Operador CNC Júnior',
        sector: 'Usinagem CNC',
        targetRole: 'Operador CNC Pleno',
        focusSkill: 'Programação de Código G na máquina',
        action70: 'Programar peças simples de teste sob tutela do especialista',
        action20: 'Mentoria com Marcos Vinicius toda terça-feira',
        action10: 'Módulo SENAI de Programação CNC 40h'
      }
    ]
  },

  // 6. Aptis 1:1 (Reuniões Estratégicas de Liderança)
  'one-on-one': {
    toolId: 'one-on-one',
    toolTitle: 'Aptis 1:1',
    subtitle: 'Importe a agenda de liderados, periodicidade e pautas fixas',
    templateFilename: 'aptis_one_on_one_agenda.xlsx',
    columns: [
      {
        key: 'employeeName',
        label: 'Nome do Liderado',
        required: true,
        example: 'Aline Ferreira',
        description: 'Colaborador com quem o líder realiza a conversa 1:1',
        synonyms: ['liderado', 'nome', 'colaborador', 'funcionario']
      },
      {
        key: 'role',
        label: 'Cargo',
        required: true,
        example: 'Operadora de Usinagem Pleno',
        description: 'Função do liderado',
        synonyms: ['cargo', 'funcao']
      },
      {
        key: 'sector',
        label: 'Setor',
        required: true,
        example: 'Usinagem CNC',
        description: 'Setor da fábrica',
        synonyms: ['setor', 'area']
      },
      {
        key: 'frequency',
        label: 'Frequencia',
        required: false,
        example: 'Quinzenal',
        description: 'Semanal, Quinzenal ou Mensal',
        synonyms: ['frequencia', 'periodicidade', 'ritmo']
      },
      {
        key: 'nextDate',
        label: 'Data Proxima Reuniao',
        required: false,
        example: '2026-10-24',
        description: 'Data da próxima sessão (AAAA-MM-DD)',
        synonyms: ['data', 'proxima data', 'agendamento']
      },
      {
        key: 'keyTopics',
        label: 'Topicos Chave',
        required: false,
        example: 'Transição de turno, clima na célula e metas de polivalência',
        description: 'Pauta ou assuntos estratégicos',
        synonyms: ['topicos', 'pauta', 'assuntos', 'observacoes']
      }
    ],
    sampleRows: [
      {
        employeeName: 'Beatriz Lima',
        role: 'Operadora Líder de Prensas',
        sector: 'Estamparia & Prensas',
        frequency: 'Semanal',
        nextDate: '2026-10-18',
        keyTopics: 'Setup rápido SMED e acompanhamento de faltas'
      }
    ]
  },

  // 7. Aptis TWTTP & HERCA (Investigação WCM de Erro Humano)
  'twttp-herca': {
    toolId: 'twttp-herca',
    toolTitle: 'Aptis TWTTP & HERCA',
    subtitle: 'Importe histórico de desvios operacionais, mecanismo de erro e Poka-Yokes',
    templateFilename: 'aptis_twttp_herca_desvios.xlsx',
    columns: [
      {
        key: 'title',
        label: 'Descricao do Desvio',
        required: true,
        example: 'Montagem invertida do retentor na carcaça de alumínio',
        description: 'O que ocorreu de forma objetiva no Gemba',
        synonyms: ['desvio', 'titulo', 'falha', 'incidente', 'ocorrencia']
      },
      {
        key: 'sector',
        label: 'Setor',
        required: true,
        example: 'Montagem & Solda',
        description: 'Local do desvio',
        synonyms: ['setor', 'area', 'linha']
      },
      {
        key: 'failureDate',
        label: 'Data da Falha',
        required: false,
        example: '2026-09-28',
        description: 'Data do evento (AAAA-MM-DD)',
        synonyms: ['data', 'data falha', 'data ocorrencia']
      },
      {
        key: 'operatorRole',
        label: 'Cargo do Operador',
        required: false,
        example: 'Montador Mecânico',
        description: 'Função de quem operava no momento',
        synonyms: ['cargo', 'funcao', 'operador']
      },
      {
        key: 'hercaMechanism',
        label: 'Mecanismo HERCA',
        required: false,
        example: 'Atenção (Falha de Distração)',
        description: 'Atencao, Memoria, Decisao ou Execucao',
        synonyms: ['herca', 'mecanismo', 'causa humana', 'tipo de erro']
      },
      {
        key: 'pokaYokeAction',
        label: 'Barreira Fisica Poka-Yoke Proposta',
        required: false,
        example: 'Gabarito com pino guia assimétrico que impede encaixe invertido',
        description: 'Barreira física que impede o erro (WCM)',
        synonyms: ['poka yoke', 'barreira fisica', 'solucao definitiva', 'bloqueio']
      },
      {
        key: 'status',
        label: 'Status',
        required: false,
        example: 'Em Investigação',
        description: 'Em Investigacao, Poka-Yoke em Teste ou Padronizado',
        synonyms: ['status', 'situacao', 'fase']
      }
    ],
    sampleRows: [
      {
        title: 'Peça usinada fora de centro por cavaco no mordente',
        sector: 'Usinagem CNC',
        failureDate: '2026-10-02',
        operatorRole: 'Operador CNC',
        hercaMechanism: 'Memória (Omissão da etapa de limpeza)',
        pokaYokeAction: 'Bico automático de ar comprimido acionado antes do fechamento da placa',
        status: 'Poka-Yoke em Teste'
      }
    ]
  },

  // 8. Aptis Service Pro (Gestão de Manutenção de Terceiros e Equipamentos)
  'service-pro': {
    toolId: 'service-pro',
    toolTitle: 'Aptis Service Pro',
    subtitle: 'Importe catálogo de máquinas, clientes e periodicidades de manutenção',
    templateFilename: 'aptis_service_pro_maquinas.xlsx',
    columns: [
      {
        key: 'clientName',
        label: 'Nome da Empresa Cliente',
        required: true,
        example: 'Metalúrgica São Bento S/A',
        description: 'Razão social ou fantasia da planta cliente',
        synonyms: ['cliente', 'empresa', 'contratante', 'fabrica']
      },
      {
        key: 'equipmentName',
        label: 'Nome do Equipamento',
        required: true,
        example: 'Compressor Parafuso 50HP',
        description: 'Nome da máquina ou ativo',
        synonyms: ['equipamento', 'maquina', 'ativo', 'nome do equipamento']
      },
      {
        key: 'tag',
        label: 'TAG ou Codigo Patrimonial',
        required: false,
        example: 'COMP-04',
        description: 'TAG identificadora na planta',
        synonyms: ['tag', 'codigo', 'patrimonio', 'identificacao']
      },
      {
        key: 'sector',
        label: 'Setor ou Linha',
        required: true,
        example: 'Casa de Compressores',
        description: 'Localização física do ativo',
        synonyms: ['setor', 'linha', 'area', 'local']
      },
      {
        key: 'manufacturer',
        label: 'Fabricante ou Modelo',
        required: false,
        example: 'Atlas Copco GA-37',
        description: 'Marca e modelo do equipamento',
        synonyms: ['fabricante', 'marca', 'modelo']
      },
      {
        key: 'criticality',
        label: 'Criticidade',
        required: false,
        example: 'Alta',
        description: 'Baixa, Media, Alta ou Critica',
        synonyms: ['criticidade', 'importancia', 'nivel']
      },
      {
        key: 'preventiveIntervalDays',
        label: 'Intervalo Preventivo (Dias)',
        required: false,
        example: '90',
        description: 'Frequência da manutenção preventiva em dias',
        synonyms: ['periodicidade', 'dias', 'intervalo', 'frequencia preventiva']
      }
    ],
    sampleRows: [
      {
        clientName: 'Metalúrgica São Bento S/A',
        equipmentName: 'Prensa Excêntrica 200T',
        tag: 'PREN-02',
        sector: 'Estamparia & Prensas',
        manufacturer: 'Schuler',
        criticality: 'Crítica',
        preventiveIntervalDays: '30'
      },
      {
        clientName: 'Metalúrgica São Bento S/A',
        equipmentName: 'Torno CNC Romi D800',
        tag: 'CNC-01',
        sector: 'Usinagem CNC',
        manufacturer: 'Romi',
        criticality: 'Alta',
        preventiveIntervalDays: '60'
      }
    ]
  },

  // 9. Aptis Advisory (Gestão para Consultorias e Assessorias B2B)
  'advisory': {
    toolId: 'advisory',
    toolTitle: 'Aptis Advisory',
    subtitle: 'Importe roadmap de entregas, marcos contratuais e metas do cliente',
    templateFilename: 'aptis_advisory_roadmap.xlsx',
    columns: [
      {
        key: 'clientName',
        label: 'Cliente',
        required: true,
        example: 'Indústrias Metalmax Ltda.',
        description: 'Nome do cliente de consultoria',
        synonyms: ['cliente', 'contratante', 'empresa']
      },
      {
        key: 'projectName',
        label: 'Projeto',
        required: true,
        example: 'Programa de Excelência Operacional WCM',
        description: 'Nome do contrato ou projeto',
        synonyms: ['projeto', 'contrato', 'escopo']
      },
      {
        key: 'dimension',
        label: 'Dimensao Lean',
        required: false,
        example: 'Manutenção Autônoma',
        description: 'Pilar WCM ou área foco da consultoria',
        synonyms: ['dimensao', 'pilar', 'area foco']
      },
      {
        key: 'milestoneTitle',
        label: 'Marco ou Entrega',
        required: true,
        example: 'Implementação de Limpeza Inicial e Etiquetas Vermelhas',
        description: 'Entregável específico do roadmap',
        synonyms: ['marco', 'entrega', 'entregavel', 'atividade']
      },
      {
        key: 'responsiblePerson',
        label: 'Responsavel no Cliente',
        required: false,
        example: 'Carlos Silveira (Gerente Industrial)',
        description: 'Ponto focal interno no cliente',
        synonyms: ['responsavel', 'focal', 'lider cliente']
      },
      {
        key: 'dueDate',
        label: 'Prazo',
        required: false,
        example: '2026-11-15',
        description: 'Data acordada de conclusão (AAAA-MM-DD)',
        synonyms: ['prazo', 'data', 'vencimento']
      },
      {
        key: 'status',
        label: 'Status',
        required: false,
        example: 'No Prazo',
        description: 'No Prazo, Aguardando Cliente, Em Risco ou Concluido',
        synonyms: ['status', 'situacao', 'semaforo']
      }
    ],
    sampleRows: [
      {
        clientName: 'Indústrias Metalmax Ltda.',
        projectName: 'Redução de Setup SMED',
        dimension: 'Fluxo Contínuo',
        milestoneTitle: 'Mapeamento em Vídeo do Setup da Prensa 500t',
        responsiblePerson: 'Marcos Vinicius',
        dueDate: '2026-10-30',
        status: 'No Prazo'
      }
    ]
  }
};
