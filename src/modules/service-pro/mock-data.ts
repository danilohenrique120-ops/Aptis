import {
  ClientContractor,
  Equipment,
  MasterCatalogItem,
  MaintenanceWorkOrder,
  CrossClientDiagnostic,
  NotificationRule
} from './types';

export const INITIAL_CLIENTS: ClientContractor[] = [
  {
    id: 'cli-1',
    name: 'Metalúrgica Vale do Aço S/A',
    tradeName: 'Vale do Aço Indústria',
    cnpj: '18.442.901/0001-44',
    segment: 'Metalmecânica & Usinagem Pesada',
    slaHours: 4,
    contractValueMonthly: 8500,
    contractStartDate: '2024-02-01',
    contractStatus: 'active',
    branches: [
      {
        id: 'br-101',
        name: 'Planta Principal - Usinagem',
        address: 'Av. das Indústrias, 4500 - Distrito Industrial',
        city: 'Contagem',
        state: 'MG',
        contactPerson: 'Eng. Roberto Vianna',
        contactPhone: '(31) 98744-1122'
      },
      {
        id: 'br-102',
        name: 'Unidade 2 - Tratamento Térmico',
        address: 'Rua do Aço, 120 - Galpão 04',
        city: 'Betim',
        state: 'MG',
        contactPerson: 'Marcos Silveira',
        contactPhone: '(31) 99123-4567'
      }
    ],
    contacts: [
      {
        id: 'ct-1',
        name: 'Roberto Vianna',
        role: 'Gerente Geral de Planta',
        email: 'roberto.vianna@valedoaco.com.br',
        phone: '(31) 98744-1122',
        isPrimary: true
      },
      {
        id: 'ct-2',
        name: 'Fernanda Toledo',
        role: 'Coordenadora de Manutenção Interna',
        email: 'fernanda.toledo@valedoaco.com.br',
        phone: '(31) 99888-3322',
        isPrimary: false
      }
    ],
    notes: 'Cliente prioritário com alta demanda de ar comprimido e pontes rolantes.',
    totalEquipmentsCount: 3
  },
  {
    id: 'cli-2',
    name: 'Laticínios Alvorada Ltda',
    tradeName: 'Laticínios Alvorada',
    cnpj: '24.112.553/0001-89',
    segment: 'Alimentos & Bebidas',
    slaHours: 6,
    contractValueMonthly: 6200,
    contractStartDate: '2024-06-15',
    contractStatus: 'active',
    branches: [
      {
        id: 'br-201',
        name: 'Fábrica de Processamento & Queijos',
        address: 'Rodovia MG-050, Km 82',
        city: 'Itaúna',
        state: 'MG',
        contactPerson: 'Carlos Eduardo Mendes',
        contactPhone: '(37) 99811-9988'
      }
    ],
    contacts: [
      {
        id: 'ct-3',
        name: 'Carlos Eduardo Mendes',
        role: 'Diretor Industrial',
        email: 'carlos@alvorada.ind.br',
        phone: '(37) 99811-9988',
        isPrimary: true
      }
    ],
    notes: 'Exigência estrita de PMOC e registros de calibração para inspeção do SIF.',
    totalEquipmentsCount: 2
  },
  {
    id: 'cli-3',
    name: 'BioCure Farmacêutica do Brasil',
    tradeName: 'BioCure Pharma',
    cnpj: '33.908.122/0001-02',
    segment: 'Farmacêutico & Laboratorial',
    slaHours: 2,
    contractValueMonthly: 12800,
    contractStartDate: '2023-11-01',
    contractStatus: 'active',
    branches: [
      {
        id: 'br-301',
        name: 'Complexo Cleanroom & Biorreatores',
        address: 'Parque Tecnológico, Lote 12',
        city: 'Belo Horizonte',
        state: 'MG',
        contactPerson: 'Dra. Vanessa Meireles',
        contactPhone: '(31) 98455-7766'
      }
    ],
    contacts: [
      {
        id: 'ct-4',
        name: 'Dra. Vanessa Meireles',
        role: 'Gerente de Validação & Facilities',
        email: 'vanessa.meireles@biocure.com.br',
        phone: '(31) 98455-7766',
        isPrimary: true
      }
    ],
    notes: 'Ambiente controlado sala limpa classe ISO 7. Todos os técnicos com EPI estéril.',
    totalEquipmentsCount: 2
  },
  {
    id: 'cli-4',
    name: 'Centro Logístico Rápido & Frio Ltda',
    tradeName: 'LogFrio Distribuição',
    cnpj: '45.772.339/0001-70',
    segment: 'Armazenagem & Câmaras Frias',
    slaHours: 3,
    contractValueMonthly: 7400,
    contractStartDate: '2024-09-01',
    contractStatus: 'active',
    branches: [
      {
        id: 'br-401',
        name: 'CD Central - Câmaras Frigoríficas',
        address: 'Anel Rodoviário, Km 15',
        city: 'Contagem',
        state: 'MG',
        contactPerson: 'Alexandre Pires',
        contactPhone: '(31) 97122-3344'
      }
    ],
    contacts: [
      {
        id: 'ct-5',
        name: 'Alexandre Pires',
        role: 'Supervisor de Manutenção & Frota',
        email: 'alexandre@logfrio.com.br',
        phone: '(31) 97122-3344',
        isPrimary: true
      }
    ],
    notes: 'Controle de temperatura rigoroso em -20ºC nas câmaras de congelados.',
    totalEquipmentsCount: 1
  }
];

export const INITIAL_MASTER_CATALOG: MasterCatalogItem[] = [
  {
    id: 'cat-schulz-srp4030',
    category: 'Ar Comprimido & Compressores',
    brand: 'Schulz',
    model: 'SRP 4030 Dynamic',
    capacity: '30 HP / 128 pcm / 10 bar',
    specs: [
      { key: 'voltage', label: 'Tensão', value: '380V Trifásico' },
      { key: 'power', label: 'Potência Nominal', value: '22 kW (30 HP)' },
      { key: 'pressure', label: 'Pressão Máxima', value: '10 bar (145 psi)' },
      { key: 'oil_capacity', label: 'Carga de Óleo Sintético', value: '14 Litros ISO VG 46' }
    ],
    maintenancePlan: {
      intervalMonths: 3,
      intervalHours: 1000,
      checklistItems: [
        'Drenagem e troca do filtro de óleo e filtro de ar',
        'Verificação da tensão e alinhamento das correias de acionamento',
        'Inspeção da válvula de retenção e admissão mínima',
        'Coleta de amostra de óleo lubrificante sintético para análise',
        'Reaperto das conexões elétricas e medição de corrente nos 3 pólos'
      ],
      recommendedParts: [
        'Filtro de Ar Schulz Cód. 007.0123-0',
        'Elemento Separador Ar/Óleo Schulz 007.0245-0',
        'Óleo Sintético Schulz LUB SCHULZ 46 (Balde 20L)',
        'Jogo de Correias Gates Quad-Power 3VX630'
      ],
      legalNorm: 'NR-13'
    },
    commonSpareParts: [
      { code: 'FIL-AR-4030', description: 'Filtro de Ar para SRP 4030', suggestedReplacementInterval: '1.000 horas' },
      { code: 'SEP-OIL-4030', description: 'Elemento Separador Ar/Óleo', suggestedReplacementInterval: '4.000 horas' },
      { code: 'VAL-TER-4030', description: 'Kit Reparo Válvula Termostática', suggestedReplacementInterval: '8.000 horas' }
    ],
    manualPdfName: 'Manual_Tecnico_Schulz_SRP_4030_Oficial.pdf',
    activeDeploymentsCount: 3
  },
  {
    id: 'cat-hitachi-rcu150',
    category: 'Climatização & Refrigeração Industrial',
    brand: 'Hitachi',
    model: 'RCU-150 Chiller Parafuso',
    capacity: '150 TR (Toneladas de Refrigeração)',
    specs: [
      { key: 'voltage', label: 'Tensão', value: '440V Trifásico 60Hz' },
      { key: 'refrigerant', label: 'Gás Refrigerante', value: 'R-134a (Ecológico)' },
      { key: 'compressors_count', label: 'Compressores', value: '2 Parafusos Semi-herméticos' },
      { key: 'water_flow', label: 'Vazão de Água Gelada', value: '98 m³/h' }
    ],
    maintenancePlan: {
      intervalMonths: 1,
      checklistItems: [
        'Inspeção do superaquecimento e sub-resfriamento nos 2 circuitos',
        'Limpeza mecânica e química das serpentinas condensadoras',
        'Teste de estanqueidade contra vazamentos de gás R-134a',
        'Verificação de vibração e nível de óleo dos compressores',
        'Calibração de transdutores de pressão e termostatos',
        'Emissão de laudo mensal de conformidade PMOC'
      ],
      recommendedParts: [
        'Filtro Secador Danfoss DML 305',
        'Óleo Polioléster Emkarate RL 68H',
        'Gás R-134a Cilindro 13,6 kg'
      ],
      legalNorm: 'PMOC'
    },
    commonSpareParts: [
      { code: 'SEC-DML-305', description: 'Filtro Secador Danfoss', suggestedReplacementInterval: 'Anual / Na troca de gás' },
      { code: 'CON-ABB-AF50', description: 'Contator de Força Tripolar 50A', suggestedReplacementInterval: 'Conforme desgaste' }
    ],
    manualPdfName: 'Hitachi_RCU_Chiller_Service_Manual.pdf',
    activeDeploymentsCount: 2
  },
  {
    id: 'cat-demag-10t',
    category: 'Movimentação de Cargas & Elevação',
    brand: 'Demag',
    model: 'Ponte Rolante Biviga 10 Toneladas',
    capacity: '10 Toneladas (Vão 18 metros)',
    specs: [
      { key: 'voltage', label: 'Alimentação', value: '380V Trifásico via Barramento' },
      { key: 'cable_spec', label: 'Cabo de Aço', value: 'Diâmetro 14mm 6x36 WS Alma de Aço' },
      { key: 'span', label: 'Vão da Ponte', value: '18 metros' },
      { key: 'lifting_speed', label: 'Velocidade de Elevação', value: '6 / 1.5 m/min' }
    ],
    maintenancePlan: {
      intervalMonths: 2,
      checklistItems: [
        'Inspeção visual e dimensional do cabo de aço (fios rompidos/deformações)',
        'Teste do fim de curso superior e inferior de elevação',
        'Medição do desgaste das lonas de freio dos motores de translação e talha',
        'Inspeção do gancho de carga e trava de segurança contra abertura',
        'Checagem do barramento blindado e sapatas coletoras de energia',
        'Laudo de inspeção estrutural conforme NR-11 e NR-12'
      ],
      recommendedParts: [
        'Cabo de Aço 14mm Demag Genuíno',
        'Jogo de Pastilhas de Freio Eletromagnético',
        'Guia de Cabo de Aço da Talha DH'
      ],
      legalNorm: 'NR-12'
    },
    commonSpareParts: [
      { code: 'LON-FRE-10T', description: 'Guarnição de Freio Talha 10T', suggestedReplacementInterval: 'Semestral / Conforme desgaste' },
      { code: 'TRA-GAN-10T', description: 'Trava de Segurança Forjada para Gancho', suggestedReplacementInterval: 'Inspeção bimestral' }
    ],
    manualPdfName: 'Demag_Cranes_DH_Hoist_Service_Guide.pdf',
    activeDeploymentsCount: 2
  },
  {
    id: 'cat-cummins-c150',
    category: 'Geração de Energia & Grupos Geradores',
    brand: 'Cummins',
    model: 'Grupo Gerador C150 D6',
    capacity: '150 kVA Standby / 135 kVA Prime',
    specs: [
      { key: 'engine', label: 'Motor Diesel', value: 'Cummins 6BTA5.9-G2' },
      { key: 'alternator', label: 'Alternador', value: 'Stamford UCI274E' },
      { key: 'voltage', label: 'Tensão', value: '220/127V ou 380/220V' },
      { key: 'battery', label: 'Bateria de Partida', value: '2x 12V 100Ah Selada' }
    ],
    maintenancePlan: {
      intervalMonths: 1,
      checklistItems: [
        'Teste de partida automática com simulação de corte de rede (QTA)',
        'Verificação da densidade e tensão das baterias de partida',
        'Drenagem de água do filtro sedimentador de óleo diesel',
        'Inspeção do nível e aditivo do líquido de arrefecimento do radiador',
        'Checagem do pré-aquecimento do bloco do motor'
      ],
      recommendedParts: [
        'Filtro Lubrificante Fleetguard LF3349',
        'Filtro Combustível Separador Fleetguard FS1280',
        'Líquido Refrigerante Compleat CC2825'
      ],
      legalNorm: 'NR-10'
    },
    commonSpareParts: [
      { code: 'FIL-LF-3349', description: 'Filtro Óleo Cummins', suggestedReplacementInterval: '250 horas / 6 meses' },
      { code: 'REL-QTA-CUM', description: 'Controlador Microprocessado DeepSea', suggestedReplacementInterval: 'Preventivo' }
    ],
    manualPdfName: 'Cummins_Power_C150_Technical_Manual.pdf',
    activeDeploymentsCount: 1
  }
];

export const INITIAL_EQUIPMENTS: Equipment[] = [
  {
    id: 'eq-1',
    clientId: 'cli-1',
    clientName: 'Metalúrgica Vale do Aço S/A',
    branchId: 'br-101',
    branchName: 'Planta Principal - Usinagem',
    tag: 'COMP-01',
    name: 'Compressor de Ar Central 01',
    category: 'Ar Comprimido & Compressores',
    brand: 'Schulz',
    model: 'SRP 4030 Dynamic',
    serialNumber: 'SCH-2023-99812',
    manufacturingYear: 2023,
    capacity: '30 HP / 128 pcm',
    locationInPlant: 'Sala de Compressores - Galpão Usinagem',
    criticality: 'high',
    status: 'operational',
    lastServiceDate: '2026-06-20',
    nextPreventiveDate: '2026-09-20', // Vencida
    specs: [
      { key: 'voltage', label: 'Tensão', value: '380V Trifásico' },
      { key: 'power', label: 'Potência Nominal', value: '22 kW (30 HP)' },
      { key: 'pressure', label: 'Pressão Máxima', value: '10 bar' }
    ],
    maintenancePlan: {
      intervalMonths: 3,
      intervalHours: 1000,
      checklistItems: [
        'Drenagem e troca do filtro de óleo e filtro de ar',
        'Verificação da tensão e alinhamento das correias de acionamento',
        'Inspeção da válvula de retenção e admissão mínima'
      ],
      recommendedParts: [
        'Filtro de Ar Schulz Cód. 007.0123-0',
        'Óleo Sintético Schulz LUB 46'
      ],
      legalNorm: 'NR-13'
    },
    qrCodeId: 'QR-COMP-01-VALE',
    qrCodeUrl: 'https://aptis.io/qr/eq-1'
  },
  {
    id: 'eq-2',
    clientId: 'cli-1',
    clientName: 'Metalúrgica Vale do Aço S/A',
    branchId: 'br-101',
    branchName: 'Planta Principal - Usinagem',
    tag: 'PONT-02',
    name: 'Ponte Rolante Biviga Usinagem Pesada',
    category: 'Movimentação de Cargas & Elevação',
    brand: 'Demag',
    model: 'Ponte Rolante Biviga 10 Toneladas',
    serialNumber: 'DMG-2021-4411',
    manufacturingYear: 2021,
    capacity: '10 Toneladas',
    locationInPlant: 'Baia de Usinagem 01 - Eixo A/B',
    criticality: 'high',
    status: 'warning',
    lastServiceDate: '2026-07-28',
    nextPreventiveDate: '2026-09-28', // Amanhã
    specs: [
      { key: 'voltage', label: 'Alimentação', value: '380V Trifásico' },
      { key: 'cable_spec', label: 'Cabo de Aço', value: 'Diâmetro 14mm 6x36' }
    ],
    maintenancePlan: {
      intervalMonths: 2,
      checklistItems: [
        'Inspeção visual e dimensional do cabo de aço',
        'Teste do fim de curso superior e inferior de elevação',
        'Medição do desgaste das lonas de freio'
      ],
      recommendedParts: ['Pastilhas de freio magnético'],
      legalNorm: 'NR-12'
    },
    qrCodeId: 'QR-PONT-02-VALE',
    qrCodeUrl: 'https://aptis.io/qr/eq-2'
  },
  {
    id: 'eq-3',
    clientId: 'cli-1',
    clientName: 'Metalúrgica Vale do Aço S/A',
    branchId: 'br-102',
    branchName: 'Unidade 2 - Tratamento Térmico',
    tag: 'GER-01',
    name: 'Grupo Gerador de Emergência',
    category: 'Geração de Energia & Grupos Geradores',
    brand: 'Cummins',
    model: 'Grupo Gerador C150 D6',
    serialNumber: 'CUM-2022-8812',
    manufacturingYear: 2022,
    capacity: '150 kVA',
    locationInPlant: 'Subestação Elétrica Externa',
    criticality: 'medium',
    status: 'operational',
    lastServiceDate: '2026-09-05',
    nextPreventiveDate: '2026-10-05',
    specs: [
      { key: 'voltage', label: 'Tensão', value: '380/220V' },
      { key: 'engine', label: 'Motor Diesel', value: 'Cummins 6BTA5.9-G2' }
    ],
    maintenancePlan: {
      intervalMonths: 1,
      checklistItems: [
        'Teste de partida automática com simulação de corte de rede',
        'Checagem da tensão da bateria de partida',
        'Drenagem do filtro separador de água'
      ],
      recommendedParts: ['Filtro Lubrificante LF3349'],
      legalNorm: 'NR-10'
    },
    qrCodeId: 'QR-GER-01-VALE',
    qrCodeUrl: 'https://aptis.io/qr/eq-3'
  },
  {
    id: 'eq-4',
    clientId: 'cli-2',
    clientName: 'Laticínios Alvorada Ltda',
    branchId: 'br-201',
    branchName: 'Fábrica de Processamento & Queijos',
    tag: 'CHILL-01',
    name: 'Chiller Central da Pasteurização',
    category: 'Climatização & Refrigeração Industrial',
    brand: 'Hitachi',
    model: 'RCU-150 Chiller Parafuso',
    serialNumber: 'HIT-2023-1109',
    manufacturingYear: 2023,
    capacity: '150 TR',
    locationInPlant: 'Central de Água Gelada (CAG)',
    criticality: 'high',
    status: 'operational',
    lastServiceDate: '2026-09-01',
    nextPreventiveDate: '2026-10-01',
    specs: [
      { key: 'voltage', label: 'Tensão', value: '440V Trifásico' },
      { key: 'refrigerant', label: 'Refrigerante', value: 'R-134a' }
    ],
    maintenancePlan: {
      intervalMonths: 1,
      checklistItems: [
        'Inspeção do superaquecimento e sub-resfriamento',
        'Limpeza mecânica e química das serpentinas condensadoras',
        'Emissão de laudo mensal de conformidade PMOC'
      ],
      recommendedParts: ['Filtro Secador Danfoss DML 305'],
      legalNorm: 'PMOC'
    },
    qrCodeId: 'QR-CHILL-01-ALVO',
    qrCodeUrl: 'https://aptis.io/qr/eq-4'
  },
  {
    id: 'eq-5',
    clientId: 'cli-2',
    clientName: 'Laticínios Alvorada Ltda',
    branchId: 'br-201',
    branchName: 'Fábrica de Processamento & Queijos',
    tag: 'COMP-02',
    name: 'Compressor Ar Comprimido Linha Envase',
    category: 'Ar Comprimido & Compressores',
    brand: 'Schulz',
    model: 'SRP 4030 Dynamic',
    serialNumber: 'SCH-2024-1184',
    manufacturingYear: 2024,
    capacity: '30 HP / 128 pcm',
    locationInPlant: 'Sala de Utilidades do Envase',
    criticality: 'high',
    status: 'critical',
    lastServiceDate: '2026-07-10',
    nextPreventiveDate: '2026-09-25', // Vencida há 2 dias
    specs: [
      { key: 'voltage', label: 'Tensão', value: '380V Trifásico' },
      { key: 'power', label: 'Potência', value: '22 kW (30 HP)' }
    ],
    maintenancePlan: {
      intervalMonths: 3,
      intervalHours: 1000,
      checklistItems: [
        'Drenagem e troca do filtro de óleo e filtro de ar',
        'Verificação da tensão e alinhamento das correias'
      ],
      recommendedParts: ['Filtro de Ar Schulz', 'Óleo LUB 46'],
      legalNorm: 'NR-13'
    },
    qrCodeId: 'QR-COMP-02-ALVO',
    qrCodeUrl: 'https://aptis.io/qr/eq-5'
  },
  {
    id: 'eq-6',
    clientId: 'cli-3',
    clientName: 'BioCure Farmacêutica do Brasil',
    branchId: 'br-301',
    branchName: 'Complexo Cleanroom & Biorreatores',
    tag: 'CHILL-02',
    name: 'Chiller Sala Limpa & Biorreatores B11-B16',
    category: 'Climatização & Refrigeração Industrial',
    brand: 'Hitachi',
    model: 'RCU-150 Chiller Parafuso',
    serialNumber: 'HIT-2024-9901',
    manufacturingYear: 2024,
    capacity: '150 TR',
    locationInPlant: 'Cobertura Técnica - Bloco Farmacêutico',
    criticality: 'high',
    status: 'operational',
    lastServiceDate: '2026-09-12',
    nextPreventiveDate: '2026-10-12',
    specs: [
      { key: 'voltage', label: 'Tensão', value: '440V Trifásico' },
      { key: 'water_temp', label: 'Set-Point Água', value: '4.0ºC Constante' }
    ],
    maintenancePlan: {
      intervalMonths: 1,
      checklistItems: [
        'Inspeção do superaquecimento e sub-resfriamento',
        'Checagem da vazão de água gelada para trocadores de calor'
      ],
      recommendedParts: ['Filtro Danfoss DML 305'],
      legalNorm: 'PMOC'
    },
    qrCodeId: 'QR-CHILL-02-BIOC',
    qrCodeUrl: 'https://aptis.io/qr/eq-6'
  },
  {
    id: 'eq-7',
    clientId: 'cli-3',
    clientName: 'BioCure Farmacêutica do Brasil',
    branchId: 'br-301',
    branchName: 'Complexo Cleanroom & Biorreatores',
    tag: 'PONT-01',
    name: 'Talha Elétrica Manutenção de Autoclaves',
    category: 'Movimentação de Cargas & Elevação',
    brand: 'Demag',
    model: 'Ponte Rolante Biviga 10 Toneladas',
    serialNumber: 'DMG-2023-7714',
    manufacturingYear: 2023,
    capacity: '5 Toneladas',
    locationInPlant: 'Área de Limpeza e Autoclavação',
    criticality: 'medium',
    status: 'operational',
    lastServiceDate: '2026-08-10',
    nextPreventiveDate: '2026-10-10',
    specs: [
      { key: 'voltage', label: 'Alimentação', value: '380V Trifásico' }
    ],
    maintenancePlan: {
      intervalMonths: 2,
      checklistItems: ['Inspeção de cabo de aço e travas de gancho'],
      recommendedParts: ['Cabo de aço 14mm'],
      legalNorm: 'NR-12'
    },
    qrCodeId: 'QR-PONT-01-BIOC',
    qrCodeUrl: 'https://aptis.io/qr/eq-7'
  },
  {
    id: 'eq-8',
    clientId: 'cli-4',
    clientName: 'Centro Logístico Rápido & Frio Ltda',
    branchId: 'br-401',
    branchName: 'CD Central - Câmaras Frigoríficas',
    tag: 'CHILL-FRIO',
    name: 'Chiller Central de Amônia / Glicol',
    category: 'Climatização & Refrigeração Industrial',
    brand: 'Hitachi',
    model: 'RCU-150 Chiller Parafuso',
    serialNumber: 'HIT-2022-3144',
    manufacturingYear: 2022,
    capacity: '150 TR',
    locationInPlant: 'Sala de Máquinas Frigoríficas',
    criticality: 'high',
    status: 'operational',
    lastServiceDate: '2026-09-18',
    nextPreventiveDate: '2026-10-18',
    specs: [
      { key: 'voltage', label: 'Tensão', value: '440V Trifásico' }
    ],
    maintenancePlan: {
      intervalMonths: 1,
      checklistItems: ['Inspeção de compressores e pressões'],
      recommendedParts: ['Filtro DML 305'],
      legalNorm: 'PMOC'
    },
    qrCodeId: 'QR-CHILL-FRIO',
    qrCodeUrl: 'https://aptis.io/qr/eq-8'
  }
];

export const INITIAL_WORK_ORDERS: MaintenanceWorkOrder[] = [
  {
    id: 'os-1',
    orderNumber: 'OS-2026-091',
    clientId: 'cli-1',
    clientName: 'Metalúrgica Vale do Aço S/A',
    branchId: 'br-101',
    branchName: 'Planta Principal - Usinagem',
    equipmentId: 'eq-1',
    equipmentTag: 'COMP-01',
    equipmentName: 'Compressor de Ar Central 01',
    equipmentModel: 'Schulz SRP 4030 Dynamic',
    type: 'preventive',
    status: 'scheduled',
    priority: 'high',
    scheduledDate: '2026-09-28', // Amanhã
    scheduledTimeWindow: '08:00 - 12:00',
    technicianName: 'Rodrigo Santoro (Mecânico Sênior)',
    technicianPhone: '(31) 98711-2233',
    symptomsReported: 'Manutenção preventiva periódica trimestral de 1.000 horas vencida.',
    checklist: [
      { id: 'chk-1', description: 'Trocar filtro de óleo e filtro de ar', status: 'not_applicable' },
      { id: 'chk-2', description: 'Conferir tensão e alinhamento das correias', status: 'not_applicable' },
      { id: 'chk-3', description: 'Inspecionar válvula de admissão e pressão mínima', status: 'not_applicable' },
      { id: 'chk-4', description: 'Medição de corrente do motor elétrico', status: 'not_applicable' }
    ],
    sparePartsUsed: [],
    laborHours: 3.5,
    laborCost: 450,
    totalCost: 450,
    beforePhotos: [],
    afterPhotos: [],
    whatsappConfirmationSent: true,
    technicalReportSummary: 'Revisão periódica programada para restaurar eficiência energética do compressor.'
  },
  {
    id: 'os-2',
    orderNumber: 'OS-2026-090',
    clientId: 'cli-2',
    clientName: 'Laticínios Alvorada Ltda',
    branchId: 'br-201',
    branchName: 'Fábrica de Processamento & Queijos',
    equipmentId: 'eq-5',
    equipmentTag: 'COMP-02',
    equipmentName: 'Compressor Ar Comprimido Linha Envase',
    equipmentModel: 'Schulz SRP 4030 Dynamic',
    type: 'corrective',
    status: 'in_progress',
    priority: 'urgent',
    scheduledDate: '2026-09-27', // Hoje
    scheduledTimeWindow: '14:00 - 18:00',
    technicianName: 'Lucas Bernardes (Técnico de Campo)',
    technicianPhone: '(31) 99344-5566',
    symptomsReported: 'Alarme sonoro de alta temperatura de descarga (105ºC) e vibração excessiva no bloco.',
    rootCauseFound: 'Válvula termostática travada semiaberta gerando bypass do radiador de óleo.',
    checklist: [
      { id: 'chk-11', description: 'Verificação do nível e viscosidade do óleo', status: 'passed' },
      { id: 'chk-12', description: 'Desmontagem e teste da válvula termostática', status: 'failed', notes: 'Mola emperrada com borra térmica' },
      { id: 'chk-13', description: 'Limpeza do radiador de óleo arrefecedor', status: 'passed' }
    ],
    sparePartsUsed: [
      { partCode: 'VAL-TER-4030', description: 'Elemento Termostático 71ºC', quantity: 1, unitPrice: 380 }
    ],
    laborHours: 4,
    laborCost: 520,
    totalCost: 900,
    beforePhotos: [],
    afterPhotos: [],
    whatsappConfirmationSent: true,
    technicalReportSummary: 'Diagnóstico cruzado identificou causa raiz idêntica à ocorrida na Metalúrgica Vale do Aço.'
  },
  {
    id: 'os-3',
    orderNumber: 'OS-2026-088',
    clientId: 'cli-1',
    clientName: 'Metalúrgica Vale do Aço S/A',
    branchId: 'br-101',
    branchName: 'Planta Principal - Usinagem',
    equipmentId: 'eq-2',
    equipmentTag: 'PONT-02',
    equipmentName: 'Ponte Rolante Biviga Usinagem Pesada',
    equipmentModel: 'Demag Ponte Rolante Biviga 10 Toneladas',
    type: 'preventive',
    status: 'completed',
    priority: 'normal',
    scheduledDate: '2026-07-28',
    completedDate: '2026-07-28',
    technicianName: 'Rodrigo Santoro (Mecânico Sênior)',
    symptomsReported: 'Inspeção bimensal de conformidade com a NR-11 / NR-12.',
    rootCauseFound: 'Preventiva de rotina. Cabo de aço sem quebra de arames.',
    actionsTaken: 'Lubrificação do cabo de aço com graxa grafitada, regulagem das lonas de freio da talha e teste de carga.',
    checklist: [
      { id: 'chk-21', description: 'Inspeção dimensional do cabo de aço (14mm nominal)', status: 'passed' },
      { id: 'chk-22', description: 'Teste de atuação dos fins de curso elétricos', status: 'passed' },
      { id: 'chk-23', description: 'Medição da espessura das lonas de freio (mínimo 4mm)', status: 'passed' },
      { id: 'chk-24', description: 'Teste de retenção de carga suspensa 10T por 10min', status: 'passed' }
    ],
    sparePartsUsed: [
      { partCode: 'GRX-GRAF-1KG', description: 'Graxa Grafitada Especial para Cabos', quantity: 2, unitPrice: 65 }
    ],
    laborHours: 5,
    laborCost: 650,
    totalCost: 780,
    beforePhotos: [],
    afterPhotos: [],
    clientSignatureBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10,40 Q50,10 90,40 T180,30" fill="none" stroke="%230f172a" stroke-width="2"/></svg>',
    signedByName: 'Roberto Vianna (Gerente Geral)',
    signedAt: '2026-07-28 16:45',
    whatsappConfirmationSent: true,
    technicalReportSummary: 'Ponte rolante 100% aprovada e liberada para operação contínua com laudo emitido.'
  },
  {
    id: 'os-4',
    orderNumber: 'OS-2026-085',
    clientId: 'cli-3',
    clientName: 'BioCure Farmacêutica do Brasil',
    branchId: 'br-301',
    branchName: 'Complexo Cleanroom & Biorreatores',
    equipmentId: 'eq-6',
    equipmentTag: 'CHILL-02',
    equipmentName: 'Chiller Sala Limpa & Biorreatores B11-B16',
    equipmentModel: 'Hitachi RCU-150 Chiller Parafuso',
    type: 'preventive',
    status: 'completed',
    priority: 'high',
    scheduledDate: '2026-09-12',
    completedDate: '2026-09-12',
    technicianName: 'Lucas Bernardes (Técnico de Campo)',
    symptomsReported: 'Manutenção preventiva mensal PMOC e controle térmico.',
    actionsTaken: 'Limpeza das serpentinas, reaperto de bornes elétricos, calibração do transdutor de baixa pressão.',
    checklist: [
      { id: 'chk-31', description: 'Medição de pressão de sucção e descarga', status: 'passed' },
      { id: 'chk-32', description: 'Checagem de estanqueidade de refrigerante R-134a', status: 'passed' },
      { id: 'chk-33', description: 'Teste de corrente dos 2 compressores parafuso', status: 'passed' }
    ],
    sparePartsUsed: [],
    laborHours: 4,
    laborCost: 600,
    totalCost: 600,
    beforePhotos: [],
    afterPhotos: [],
    clientSignatureBase64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M15,45 Q60,15 110,42 T190,25" fill="none" stroke="%230f172a" stroke-width="2"/></svg>',
    signedByName: 'Dra. Vanessa Meireles',
    signedAt: '2026-09-12 17:30',
    whatsappConfirmationSent: true,
    technicalReportSummary: 'Chiller regulado em 4.0ºC para alimentação estável dos biorreatores.'
  }
];

export const INITIAL_CROSS_DIAGNOSTICS: CrossClientDiagnostic[] = [
  {
    equipmentModel: 'Schulz SRP 4030 Dynamic',
    equipmentCategory: 'Ar Comprimido & Compressores',
    symptomTitle: 'Superaquecimento (>100ºC) e desligamento por termostato',
    symptomKeywords: ['esquenta', 'aquecimento', 'alta temperatura', 'temperatura descarga', 'termostato', 'parou quente'],
    averageRepairTimeHours: 3.5,
    causes: [
      {
        cause: 'Válvula termostática do circuito de óleo travada fechada / com borra',
        resolution: 'Substituição do elemento térmico 71ºC e lavagem do alojamento da válvula.',
        recommendedParts: ['Elemento Termostático Schulz 71ºC', 'Anel O-Ring Viton'],
        confidenceScore: 88,
        casesResolvedCount: 7,
        clientsAffected: ['Metalúrgica Vale do Aço S/A', 'Laticínios Alvorada Ltda']
      },
      {
        cause: 'Radiador de óleo com colmatação externa de poeira/fuligem',
        resolution: 'Limpeza com ar comprimido no sentido inverso e desengraxante biodegradável.',
        recommendedParts: ['Desengraxante industrial Biodegradável'],
        confidenceScore: 74,
        casesResolvedCount: 4,
        clientsAffected: ['Metalúrgica Vale do Aço S/A']
      },
      {
        cause: 'Nível baixo de óleo sintético devido a microvazamento na mangueira de retorno',
        resolution: 'Substituição da mangueira hidráulica de alta temperatura e completamento de óleo.',
        recommendedParts: ['Mangueira aeroquip 3/8"', 'Óleo Schulz LUB 46 (2L)'],
        confidenceScore: 65,
        casesResolvedCount: 3,
        clientsAffected: ['Laticínios Alvorada Ltda']
      }
    ]
  },
  {
    equipmentModel: 'Hitachi RCU-150 Chiller Parafuso',
    equipmentCategory: 'Climatização & Refrigeração Industrial',
    symptomTitle: 'Alarme de baixa pressão de sucção (Disparo de Pressostato LP)',
    symptomKeywords: ['baixa pressao', 'sucção', 'pressostato', 'congelando evaporador', 'gas'],
    averageRepairTimeHours: 4.5,
    causes: [
      {
        cause: 'Filtro secador da linha de líquido parcialmente saturado/obstruído',
        resolution: 'Recolhimento do refrigerante, troca do filtro secador Danfoss e teste de vácuo profundo.',
        recommendedParts: ['Filtro Secador Danfoss DML 305', 'Gás R-134a 2kg reposição'],
        confidenceScore: 92,
        casesResolvedCount: 5,
        clientsAffected: ['BioCure Farmacêutica do Brasil', 'Centro Logístico Rápido & Frio Ltda']
      },
      {
        cause: 'Válvula de expansão eletrônica (EEV) descalibrada ou com bobina queimada',
        resolution: 'Troca da bobina atuadora do motor de passo e reinicialização dos parâmetros da controladora.',
        recommendedParts: ['Bobina de Válvula de Expansão Carel E2V'],
        confidenceScore: 78,
        casesResolvedCount: 3,
        clientsAffected: ['Laticínios Alvorada Ltda']
      }
    ]
  },
  {
    equipmentModel: 'Demag Ponte Rolante Biviga 10 Toneladas',
    equipmentCategory: 'Movimentação de Cargas & Elevação',
    symptomTitle: 'Ruído metálico e tranco no início da elevação de carga',
    symptomKeywords: ['tranco', 'estalo', 'estalo cabo', 'ruido metalico', 'talha vibrando'],
    averageRepairTimeHours: 3.0,
    causes: [
      {
        cause: 'Guia do cabo de aço com desgaste nas aletas ou mola de pressão frouxa',
        resolution: 'Substituição da guia de cabo em ferro fundido nodular e lubrificação da rosca do tambor.',
        recommendedParts: ['Guia de Cabo Demag DH 14mm', 'Graxa especial de cabo de aço'],
        confidenceScore: 85,
        casesResolvedCount: 4,
        clientsAffected: ['Metalúrgica Vale do Aço S/A', 'BioCure Farmacêutica do Brasil']
      },
      {
        cause: 'Lona do freio cônico com folga axial desajustada',
        resolution: 'Ajuste da folga do entreferro do freio mecânico com calibre de lâminas (0.8mm).',
        recommendedParts: ['Anel espaçador de regulagem Demag'],
        confidenceScore: 80,
        casesResolvedCount: 3,
        clientsAffected: ['Metalúrgica Vale do Aço S/A']
      }
    ]
  }
];

export const DEFAULT_NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: 'notif-30',
    type: '30_days_before',
    title: 'Aviso Pró-Ativo de Preventiva (30 dias)',
    channel: 'both',
    isEnabled: true,
    templateMessage: 'Olá {{contato_nome}}, da {{cliente_nome}}! Lembramos que a manutenção preventiva do equipamento {{equipamento_tag}} ({{equipamento_nome}}) vence em 30 dias ({{data_vencimento}}). Gostaria de agendarmos uma data conveniente para a visita técnica?'
  },
  {
    id: 'notif-7',
    type: '7_days_before',
    title: 'Confirmação de Agendamento (7 dias)',
    channel: 'whatsapp',
    isEnabled: true,
    templateMessage: 'Olá {{contato_nome}}! Confirmando a visita de preventiva técnica do equipamento {{equipamento_tag}} agendada para {{data_agendada}} no horário {{janela_horario}}.'
  },
  {
    id: 'notif-1',
    type: '1_day_before',
    title: 'Lembrete de Visita de Amanhã (1 dia)',
    channel: 'whatsapp',
    isEnabled: true,
    templateMessage: 'Olá {{contato_nome}}! O nosso técnico {{tecnico_nome}} estará na {{cliente_nome}} amanhã às {{janela_horario}} para o atendimento do equipamento {{equipamento_tag}}. Telefone do técnico: {{tecnico_telefone}}.'
  },
  {
    id: 'notif-post',
    type: 'post_service',
    title: 'Conclusão de OS & Envio de Laudo',
    channel: 'both',
    isEnabled: true,
    templateMessage: 'Atendimento concluído com sucesso! Segue o comprovante da OS {{numero_os}} do equipamento {{equipamento_tag}} assinada por {{assinado_por}}. O laudo técnico e conformidade legal já estão disponíveis no seu Portal do Cliente.'
  }
];
