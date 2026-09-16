export type KaizenCategory = 'segurança' | 'qualidade' | 'custo' | 'produtividade' | 'ergonomia';

export type KaizenStage = 'ideation' | 'analysis' | 'implementation' | 'standardized';

export interface KaizenIdea {
  id: string;
  tenantId: string;
  title: string;
  problemDescription: string;
  proposedSolution: string;
  authorName: string;
  authorRole: string;
  category: KaizenCategory;
  stage: KaizenStage;
  estimatedSavingsAnnual: number;
  hoursSavedMonthly: number;
  createdAt: string;
}
