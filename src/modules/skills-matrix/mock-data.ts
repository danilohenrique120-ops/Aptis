import { SkillStation, EmployeeSkillRecord } from './types';

export const INITIAL_STATIONS: SkillStation[] = [
  // Usinagem
  { id: 'st-cnc-4e', sectorId: 'sec-usinagem', name: 'Torno CNC 4 Eixos', category: 'Torneamento', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-cnc-cent', sectorId: 'sec-usinagem', name: 'Centro de Usinagem Vertical', category: 'Fresamento', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-retifica', sectorId: 'sec-usinagem', name: 'Retífica Cilíndrica CNC', category: 'Acabamento', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 1, targetLevel: 3 },
  { id: 'st-metrologia', sectorId: 'sec-usinagem', name: 'Controle Tridimensional (MMC)', category: 'Qualidade', skillType: 'hard_skill', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-usi-twi', sectorId: 'sec-usinagem', name: 'Didática de Treinamento TWI', category: 'Comportamental & Liderança', skillType: 'soft_skill', isCriticalForLineStop: false, minOperatorsRequired: 1, targetLevel: 3 },
  
  // Estamparia
  { id: 'st-prensa-200', sectorId: 'sec-estampagem', name: 'Prensa Hidráulica 200T', category: 'Estamparia', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-prensa-500', sectorId: 'sec-estampagem', name: 'Prensa Mecânica Excêntrica 500T', category: 'Estamparia Pesada', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-corte-laser', sectorId: 'sec-estampagem', name: 'Corte a Laser Fibra Óptica', category: 'Corte', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 1, targetLevel: 3 },
  { id: 'st-est-loto', sectorId: 'sec-estampagem', name: 'LOTO & Bloqueio de Energias', category: 'Segurança Industrial', skillType: 'hard_skill', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-est-twi', sectorId: 'sec-estampagem', name: 'Didática de Treinamento TWI', category: 'Comportamental & Liderança', skillType: 'soft_skill', isCriticalForLineStop: false, minOperatorsRequired: 1, targetLevel: 3 },

  // Montagem
  { id: 'st-solda-mig', sectorId: 'sec-montagem', name: 'Célula de Solda Robotizada MIG', category: 'Soldagem', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-bancada-mont', sectorId: 'sec-montagem', name: 'Bancada Montagem Eletromecânica', category: 'Montagem', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 3, targetLevel: 3 },
  { id: 'st-teste-estanc', sectorId: 'sec-montagem', name: 'Teste de Estanqueidade & Pressão', category: 'Qualidade Final', skillType: 'hard_station', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-mon-loto', sectorId: 'sec-montagem', name: 'LOTO & Bloqueio de Energias', category: 'Segurança Industrial', skillType: 'hard_skill', isCriticalForLineStop: true, minOperatorsRequired: 2, targetLevel: 3 },
  { id: 'st-mon-comunicacao', sectorId: 'sec-montagem', name: 'Comunicação Assertiva entre Turnos', category: 'Comportamental & Liderança', skillType: 'soft_skill', isCriticalForLineStop: false, minOperatorsRequired: 2, targetLevel: 3 }
];

export const INITIAL_EMPLOYEES: EmployeeSkillRecord[] = [
  // Usinagem
  {
    employeeId: 'emp-1',
    sectorId: 'sec-usinagem',
    employeeName: 'Marcos Vinicius',
    role: 'Operador Especialista CNC',
    shift: 'Turno A',
    skills: { 'st-cnc-4e': 4, 'st-cnc-cent': 4, 'st-retifica': 3, 'st-metrologia': 4, 'st-usi-twi': 4 }
  },
  {
    employeeId: 'emp-2',
    sectorId: 'sec-usinagem',
    employeeName: 'Aline Ferreira',
    role: 'Operadora de Usinagem Pleno',
    shift: 'Turno A',
    skills: { 'st-cnc-4e': 3, 'st-cnc-cent': 2, 'st-retifica': 1, 'st-metrologia': 3, 'st-usi-twi': 2 }
  },
  {
    employeeId: 'emp-3',
    sectorId: 'sec-usinagem',
    employeeName: 'Felipe Alencar',
    role: 'Operador CNC Júnior',
    shift: 'Turno B',
    skills: { 'st-cnc-4e': 2, 'st-cnc-cent': 1, 'st-retifica': 2, 'st-metrologia': 1, 'st-usi-twi': 1 }
  },
  {
    employeeId: 'emp-4',
    sectorId: 'sec-usinagem',
    employeeName: 'Lucas Andrade',
    role: 'Auxiliar de Usinagem',
    shift: 'Turno B',
    skills: { 'st-cnc-4e': 1, 'st-cnc-cent': 1, 'st-retifica': 1, 'st-metrologia': 1, 'st-usi-twi': 1 }
  },

  // Estamparia
  {
    employeeId: 'emp-5',
    sectorId: 'sec-estampagem',
    employeeName: 'Beatriz Lima',
    role: 'Operadora Líder de Prensas',
    shift: 'Turno A',
    skills: { 'st-prensa-200': 4, 'st-prensa-500': 4, 'st-corte-laser': 3, 'st-est-loto': 4, 'st-est-twi': 4 }
  },
  {
    employeeId: 'emp-6',
    sectorId: 'sec-estampagem',
    employeeName: 'Rodrigo Santoro',
    role: 'Operador de Prensa',
    shift: 'Turno A',
    skills: { 'st-prensa-200': 3, 'st-prensa-500': 2, 'st-corte-laser': 1, 'st-est-loto': 3, 'st-est-twi': 2 }
  },
  {
    employeeId: 'emp-7',
    sectorId: 'sec-estampagem',
    employeeName: 'Claudio Roberto',
    role: 'Operador de Corte',
    shift: 'Turno B',
    skills: { 'st-prensa-200': 1, 'st-prensa-500': 1, 'st-corte-laser': 4, 'st-est-loto': 2, 'st-est-twi': 1 }
  },

  // Montagem
  {
    employeeId: 'emp-8',
    sectorId: 'sec-montagem',
    employeeName: 'Daniel Silveira',
    role: 'Soldador Especialista',
    shift: 'Turno A',
    skills: { 'st-solda-mig': 4, 'st-bancada-mont': 3, 'st-teste-estanc': 3, 'st-mon-loto': 2, 'st-mon-comunicacao': 4 }
  },
  {
    employeeId: 'emp-9',
    sectorId: 'sec-montagem',
    employeeName: 'Vanessa Castro',
    role: 'Montadora Eletromecânica',
    shift: 'Turno A',
    skills: { 'st-solda-mig': 1, 'st-bancada-mont': 4, 'st-teste-estanc': 3, 'st-mon-loto': 1, 'st-mon-comunicacao': 2 }
  }
];
