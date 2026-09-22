export type KaizenLevel = 'quick' | 'standard' | 'major' | 'advanced';

export type KaizenCategory = 'segurança' | 'qualidade' | 'custo' | 'produtividade' | 'ergonomia';

export type KaizenStage = 'ideation' | 'analysis' | 'implementation' | 'standardized';

export interface FiveWhys {
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  rootCause: string;
}

export interface A3ActionItem {
  id: string;
  what: string; // O que fazer
  who: string; // Quem é o responsável
  when: string; // Prazo YYYY-MM-DD
  status: 'todo' | 'doing' | 'done';
}

export interface KaizenA3Data {
  // P - PLAN (Planejar)
  background: string; // 1. Contexto & Justificativa
  problemStatement: string; // 2. Declaração do Problema (com dados baseline)
  currentCondition: string; // 3. Condição Atual detalhada
  fiveWhys: FiveWhys; // 4. Análise de Causa Raiz (5 Porquês)
  targetCondition: string; // 5. Condição Almejada
  targetKpiGoal: string; // Meta mensurável (Ex: Reduzir tempo de setup em 40%)

  // D - DO (Executar)
  actionPlan: A3ActionItem[]; // 6. Plano de Ação 5W2H

  // C - CHECK (Verificar)
  verificationResults: string; // 7. Verificação de Resultados (Antes vs. Depois)
  savingsAnnual: number; // R$ economizados por ano
  hoursSavedMonthly: number; // Horas liberadas por mês
  isTargetAchieved: boolean; // Meta batida?

  // A - ACT (Padronizar & Agir)
  standardizationSummary: string; // 8. Padrões criados/revisados (POP, LPO, Treinamento)
  skillsMatrixUpdated: boolean; // Matriz de Habilidades foi atualizada?
  lessonsLearned: string; // 9. Lições aprendidas e próximos passos
}

export interface KaizenProject {
  id: string;
  tenantId: string;
  title: string;
  level: KaizenLevel; // Quick, Standard, Major, Advanced
  category: KaizenCategory;
  stage: KaizenStage;
  sector: string; // Ex: 'Usinagem CNC', 'Estamparia & Prensas', 'Montagem', 'Logística'
  area: string; // Ex: 'Célula 01', 'Linha de Prensas', 'Almoxarifado'
  leaderName: string; // Líder do Kaizen
  leaderRole: string;
  teamMembers: string[]; // Participantes ativos
  estimatedSavingsAnnual: number;
  hoursSavedMonthly: number;
  a3: KaizenA3Data;
  createdAt: string; // YYYY-MM-DD
  completedAt?: string;
}

export interface ContributorRanking {
  name: string;
  role: string;
  department: string;
  ledCount: number; // Quantos liderou
  participatedCount: number; // Em quantos participou como membro
  totalKaizens: number;
  totalPoints: number; // Quick = 10pts, Standard = 25pts, Major = 50pts, Advanced = 100pts
  totalSavingsGenerated: number;
}
