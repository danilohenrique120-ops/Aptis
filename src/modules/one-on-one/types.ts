export type EnergyMood = 1 | 2 | 3 | 4 | 5; // 1 = Desmotivado/Crítico, 3 = Neutro/Estável, 5 = Altamente Motivado

export type SpeakerRole = 'manager' | 'employee';

export interface TranscriptBlock {
  id: string;
  speaker: SpeakerRole;
  speakerName: string;
  timestamp: string; // Ex: "04:15"
  text: string;
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: 'manager' | 'employee';
  assigneeName: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

export interface AgendaTopic {
  id: string;
  title: string;
  addedBy: 'manager' | 'employee';
  isDiscussed: boolean;
}

export interface OneOnOneMeeting {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  employeeDepartment: string;
  managerName: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  moodRating: EnergyMood;
  moodNote?: string;
  topics: AgendaTopic[];
  actionItems: ActionItem[];
  transcripts: TranscriptBlock[];
  audioRecordDurationSeconds?: number;
  hasAudioRecording?: boolean;
  notes: string;
  createdAt: string;
}

export interface TeamMember1on1 {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl?: string;
  lastMeetingDate?: string;
  meetingsCount: number;
  averageMood: number;
  openActionItemsCount: number;
  status: 'up_to_date' | 'attention' | 'overdue'; // < 15 dias, 15-30 dias, > 30 dias
}

export interface PowerfulQuestionPrompt {
  id: string;
  category: 'Alinhamento & Prioridades' | 'Desafios & Bloqueios' | 'Feedback Bidirecional' | 'Carreira & PDI' | 'Bem-Estar & Clima';
  question: string;
  source: string; // Ex: "Andy Grove", "Radical Candor", "High Output Management"
  explanation: string;
}
