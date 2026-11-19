export type SkillLevel = 1 | 2 | 3 | 4;

export interface SkillLevelInfo {
  level: SkillLevel;
  code: string;
  name: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  iluoLabel: string;
}

export interface Sector {
  id: string;
  code: string;
  name: string;
  description: string;
  managerName: string;
  managerRole: string;
  authorizedRoles: string[]; // ex: ['superadmin', 'tenant_admin', 'sec-usinagem-supervisor']
  color: string;
  iconName?: string;
}

export type SkillType = 'hard_station' | 'hard_skill' | 'soft_skill';

export interface SkillStation {
  id: string;
  sectorId: string;
  name: string;
  category: string;
  skillType?: SkillType; // 'hard_station' (padrão) | 'hard_skill' | 'soft_skill'
  isCriticalForLineStop?: boolean; // Define se falta de N3+ dispara alerta de gargalo de parada
  minOperatorsRequired: number;
  targetLevel?: SkillLevel; // Nível padrão desejado (default: 3)
}

export interface EmployeeSkillRecord {
  employeeId: string;
  sectorId: string;
  employeeName: string;
  role: string;
  shift: string;
  skills: Record<string, SkillLevel>; // stationId -> level
  targetSkills?: Record<string, SkillLevel>; // stationId -> required target level
}

export interface TrainingAction {
  id: string;
  sectorId: string;
  stationId: string;
  stationName: string;
  operatorId: string;
  operatorName: string;
  mentorId: string;
  mentorName: string;
  mentorSectorId?: string;
  mentorSectorName?: string;
  mentorOrigin?: 'internal' | 'cross_sector' | 'supervisor';
  skillType?: SkillType;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate: string;
  notes?: string;
}

export type SuccessionReadiness = 'ready_now' | 'ready_medium' | 'in_development' | 'none';
export type VacancyRisk = 'low' | 'medium' | 'high' | 'critical';
export type PositionCategory = 'leadership' | 'technical_specialist' | 'critical_operator';

export interface SuccessionPlan {
  id: string;
  sectorId: string;
  keyPosition: string;
  positionCategory: PositionCategory;
  currentIncumbent: string;
  currentIncumbentRole: string;
  successorId?: string;
  successorName: string;
  readiness: SuccessionReadiness;
  readinessScore: number; // 0 - 100%
  vacancyRisk: VacancyRisk;
  developmentPlan: string;
  competencyGaps: string[];
  targetDate: string;
  mentorName?: string;
  notes?: string;
}

export type ViewTab =
  | 'dashboard'
  | 'matrix'
  | 'trainers_directory'
  | 'succession'
  | 'gap_analysis'
  | 'gestao_a_vista';
export type DisplayFormat = 'iluo_circles' | 'badges';
