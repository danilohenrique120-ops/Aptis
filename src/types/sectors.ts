export interface PlantSector {
  id: string;
  code: string;
  name: string;
  description?: string;
  managerName?: string;
  managerRole?: string;
  color?: string;
  createdAt?: string;
}

export const DEFAULT_PLANT_SECTORS: PlantSector[] = [
  {
    id: 'sec-usinagem',
    code: 'USI',
    name: 'Usinagem CNC & Precisão',
    description: 'Tornos CNC, centros de usinagem e retíficas cilíndricas.',
    managerName: 'Carlos Silveira',
    managerRole: 'Supervisor de Usinagem',
    color: 'from-blue-600 to-indigo-600',
    createdAt: '2026-01-01'
  },
  {
    id: 'sec-estampagem',
    code: 'EST',
    name: 'Estamparia & Prensas',
    description: 'Prensas hidráulicas de 200T a 500T, corte e repuxo de chapas.',
    managerName: 'Mariana Souza',
    managerRole: 'Supervisora de Estamparia',
    color: 'from-amber-600 to-orange-600',
    createdAt: '2026-01-01'
  },
  {
    id: 'sec-montagem',
    code: 'MON',
    name: 'Montagem & Solda Robotizada',
    description: 'Células de solda MIG/MAG, montagem mecânica e testes finais.',
    managerName: 'Rodrigo Santoro',
    managerRole: 'Coordenador de Montagem',
    color: 'from-emerald-600 to-teal-600',
    createdAt: '2026-01-01'
  },
  {
    id: 'sec-biorreatores',
    code: 'BIO',
    name: 'Fermentação & Biorreatores',
    description: 'Biorreatores B11-B16, autoclaves, propagação e centrifugação.',
    managerName: 'Lucas Bernardes',
    managerRole: 'Especialista de Bioprocessos',
    color: 'from-cyan-600 to-blue-600',
    createdAt: '2026-01-01'
  },
  {
    id: 'sec-qualidade',
    code: 'QAL',
    name: 'Qualidade & Laboratório',
    description: 'Controle de qualidade, inspeção de recebimento, ensaios e metrologia.',
    managerName: 'Beatriz Lima',
    managerRole: 'Coordenadora de Qualidade & EHS',
    color: 'from-purple-600 to-indigo-600',
    createdAt: '2026-01-01'
  },
  {
    id: 'sec-logistica',
    code: 'LOG',
    name: 'Logística & Expedição',
    description: 'Almoxarifado, movimentação interna, embalagem e expedição fabril.',
    managerName: 'Fernando Dias',
    managerRole: 'Supervisor de Logística',
    color: 'from-slate-600 to-slate-800',
    createdAt: '2026-01-01'
  }
];
