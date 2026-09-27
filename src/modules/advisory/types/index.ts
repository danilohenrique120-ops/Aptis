export type DeliverableStatus =
  | 'backlog'
  | 'in_progress'
  | 'blocked_by_client'
  | 'review'
  | 'completed';

export type ProjectPhase = 'diagnostico' | 'desenho' | 'implantacao' | 'sustentacao';

export interface ClientTeamMember {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface ConsultingClient {
  id: string;
  name: string;
  tradeName?: string;
  cnpj: string;
  segment: string;
  sponsorName: string;
  sponsorRole: string;
  sponsorEmail: string;
  sponsorPhone: string;
  consultantLead: string;
  contractValueMonthly: number;
  totalContractValue: number;
  startDate: string;
  targetEndDate: string;
  status: 'active' | 'completed' | 'on_hold';
  inScopeSummary: string[];
  outOfScopeSummary: string[];
  clientTeam: ClientTeamMember[];
  projectGoal: string;
}

export interface MaturityPillar {
  id: string;
  name: string;
  description: string;
  initialScore: number; // 1.0 a 5.0
  currentScore: number; // 1.0 a 5.0
  targetScore: number; // 1.0 a 5.0
  initialNotes: string;
  currentNotes: string;
}

export interface ProjectDeliverable {
  id: string;
  clientId: string;
  title: string;
  phase: ProjectPhase;
  status: DeliverableStatus;
  responsibleConsultant: string;
  responsibleClientPeer: string;
  dueDate: string;
  completionDate?: string;
  blockedSince?: string;
  blockReason?: string;
  deliverableSummary: string;
  evidenceDocName?: string;
}

export interface FinancialImpactGain {
  id: string;
  clientId: string;
  title: string;
  category: 'cost_reduction' | 'revenue_increase' | 'time_saved' | 'compliance_risk';
  recurrence: 'annual' | 'monthly' | 'one_time';
  verifiedAmount: number;
  status: 'projected' | 'validated_by_client' | 'audited';
  validatedByName?: string;
  validatedAt?: string;
  description: string;
}

export interface GovernanceMeeting {
  id: string;
  clientId: string;
  date: string;
  type: 'weekly_status' | 'board_monthly' | 'kickoff';
  title: string;
  executiveSummary: string;
  decisionsNeeded: string[];
  attendees: string[];
}
