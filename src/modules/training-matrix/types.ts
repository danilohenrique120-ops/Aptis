export type TrainingType = 'NR' | 'POP';

export type TrainingValidityStatus = 'valid' | 'expiring' | 'expired' | 'missing';

export type DocumentFileType = 'pdf' | 'docx' | 'doc' | 'txt' | 'image';

export type DocumentCategory = 
  | 'certificate'        // Certificado de Conclusão de Treinamento
  | 'procedure_pop'      // Documento oficial do Procedimento Operacional Padrão
  | 'norm_reference'     // Norma Técnica / Regulamentadora de Referência
  | 'attendance_sheet'   // Lista de Presença com assinaturas
  | 'medical_aso';       // ASO / Atestado de Saúde Ocupacional

export interface DocumentAttachment {
  id: string;
  fileName: string;
  fileType: DocumentFileType;
  fileSize: string;
  uploadDate: string;
  category: DocumentCategory;
  content: string; // Texto extraído e indexado para o mecanismo de Deep Search
  associatedId?: string; // ID do registro de treinamento ou POP
  associatedName?: string; // Nome do colaborador ou do procedimento
}

export interface TrainingRecord {
  id: string;
  tenantId: string;
  type: TrainingType; // 'NR' ou 'POP'
  code: string; // ex: 'NR-10', 'NR-35', 'POP-001', 'POP-012'
  courseName: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  completedDate: string;
  expiryDate: string;
  certificateCode: string;
  validityMonths: number;
  instructorOrEntity?: string;
  version?: string; // Para POPs: controle de versão (ex: 'v1.0', 'v2.2')
  attachments: DocumentAttachment[];
  notes?: string;
}

export interface RoleRequirement {
  role: string;
  department: string;
  requiredNRs: string[];
  requiredPOPs: string[];
}

export interface SearchMatchResult {
  document: DocumentAttachment;
  snippet: string;
  matchCount: number;
  trainingRecord?: TrainingRecord;
}
