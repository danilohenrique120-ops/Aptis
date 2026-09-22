export type InvestigationStatus = 
  | 'draft' 
  | 'under_investigation' 
  | 'actions_pending' 
  | 'effective_validated' 
  | 'closed';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ImpactCategory = 
  | 'quality' 
  | 'safety' 
  | 'production_stop' 
  | 'scrap_waste' 
  | 'biological_contamination';

export type ErrorClassificationType = 
  | 'slip' 
  | 'lapse' 
  | 'mistake_rule' 
  | 'mistake_knowledge' 
  | 'system_induced_violation' 
  | 'ergonomic_overload';

export type ActionHierarchy = 
  | 'poka_yoke' 
  | 'engineering' 
  | 'visual_control' 
  | 'procedure_opl' 
  | 'training_twttp';

export interface TwttpAssessment {
  knewWhat: boolean;
  knewWhatDetails: string;
  knewHow: boolean;
  knewHowDetails: string;
  knewWhy: boolean;
  knewWhyDetails: string;
  hadConditions: boolean;
  hadConditionsDetails: string;
  leaderInstructionMethod: 1 | 2 | 3 | 4;
  leaderNotes: string;
}

export interface HercaFiveWhys {
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  rootCauseCategory: 'Metodo' | 'MaoDeObra' | 'Maquina' | 'Material' | 'GestaoEngenharia';
  rootCauseStatement: string;
}

export interface HercaAction {
  id: string;
  investigationId: string;
  title: string;
  what: string;
  why: string;
  who: string;
  where: string;
  whenDate: string;
  how: string;
  howMuchCost?: number;
  hierarchy: ActionHierarchy;
  status: 'pending' | 'in_progress' | 'completed' | 'verified_effective';
  completedDate?: string;
  effectiveVerificationDate?: string;
  isEffective?: boolean;
}

export interface OnePointLesson {
  id: string;
  investigationId: string;
  code: string;
  title: string;
  area: string;
  station: string;
  classification: 'basic_knowledge' | 'trouble_case' | 'improvement';
  problemScenario: string;
  standardPractice: string;
  keySafetyQualityPoint: string;
  whyItMatters: string;
  preparedBy: string;
  approvedBy: string;
  createdAt: string;
}

export interface HercaInvestigation {
  id: string;
  code: string;
  title: string;
  incidentDate: string;
  shift: string;
  sector: string;
  station: string;
  operatorName: string;
  operatorExperienceMonths: number;
  severity: SeverityLevel;
  impactCategory: ImpactCategory;
  estimatedLossReais?: number;
  incidentDescription: string;
  immediateContainment: string;
  status: InvestigationStatus;
  leadInvestigator: string;
  twttp: TwttpAssessment;
  hercaErrorType: ErrorClassificationType;
  hercaSystemicFactors: string[];
  fiveWhys: HercaFiveWhys;
  actions: HercaAction[];
  opl?: OnePointLesson;
  recurrenceCount: number;
  createdAt: string;
  updatedAt: string;
}
  
export interface PlantAreaKhi {
  sector: string;
  totalInvestigations: number;
  recurrentErrors: number;
  pokaYokeImplemented: number;
  averageDaysToClose: number;
}