import type { User } from '@/types';
import type { PlantSector } from '@/types/sectors';
import type {
  ContributorRanking,
  KaizenBadge,
  KaizenLevel,
  KaizenProject,
  SectorCompletedRanking
} from './types';
import { getAccessibleSectors, isPlantAdminUser } from '@/lib/sector-access';

export const INOVA_LEVEL_POINTS: Record<KaizenLevel, number> = {
  quick: 15,
  standard: 35,
  major: 70,
  advanced: 120
};

export const INOVA_LEADERSHIP_BONUS = 15;
export const INOVA_LIKE_POINTS = 5;
export const INOVA_YOKOTEN_POINTS = 25;

export function normalizeSectorText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifica se um projeto Kaizen pertence a um determinado setor da planta.
 * Suporta tanto o novo vínculo exato por `sectorId` quanto projetos legados vinculados por nome.
 */
export function kaizenBelongsToSector(
  project: Pick<KaizenProject, 'sectorId' | 'sector'>,
  sector: Pick<PlantSector, 'id' | 'code' | 'name'>
): boolean {
  if (!project || !sector) return false;
  if (project.sectorId) {
    return project.sectorId === sector.id;
  }

  const projNorm = normalizeSectorText(project.sector);
  const secNameNorm = normalizeSectorText(sector.name);
  const secCodeNorm = normalizeSectorText(sector.code);

  if (!projNorm) return false;
  if (projNorm === secNameNorm || projNorm === secCodeNorm) return true;
  if (secNameNorm.includes(projNorm) || projNorm.includes(secNameNorm)) return true;

  const projPrimaryWord = projNorm.split(' ').find(w => w.length >= 5);
  const secPrimaryWord = secNameNorm.split(' ').find(w => w.length >= 5);
  if (projPrimaryWord && secPrimaryWord && projPrimaryWord === secPrimaryWord) {
    return true;
  }

  return false;
}

/**
 * Filtra os projetos de GESTÃO INTERNA que o usuário logado tem permissão de visualizar/editar.
 * Admin da planta vê todos; Gestor de Área vê estritamente os setores vinculados ao seu perfil.
 */
export function filterKaizensForUser(
  projects: KaizenProject[],
  plantSectors: PlantSector[],
  user?: User | null
): KaizenProject[] {
  if (!Array.isArray(projects)) return [];
  if (!user) return [];
  if (isPlantAdminUser(user)) return projects;

  const accessible = getAccessibleSectors(plantSectors, user);
  if (accessible.length === 0) return [];

  return projects.filter(proj =>
    accessible.some(sector => kaizenBelongsToSector(proj, sector))
  );
}

/**
 * Determina se o usuário pode editar/excluir/publicar um projeto Kaizen específico.
 */
export function canEditKaizen(
  project: KaizenProject,
  plantSectors: PlantSector[],
  user?: User | null
): boolean {
  if (!user || !project) return false;
  if (isPlantAdminUser(user)) return true;

  const accessible = getAccessibleSectors(plantSectors, user);
  return accessible.some(sector => kaizenBelongsToSector(project, sector));
}

/**
 * REGRA DE OURO DO FEED INOVA:
 * Somente projetos efetivamente concluídos e implementados (`stage === 'standardized'`) podem subir para o Feed!
 */
export function canPublishToFeed(project?: Pick<KaizenProject, 'stage'> | null): boolean {
  return Boolean(project && project.stage === 'standardized');
}

/**
 * Retorna exclusivamente os projetos públicos do Feed Inova da Fábrica.
 * Aplica trava dupla: precisa estar em `standardized` E marcado com `isPublishedToFeed === true`.
 */
export function getPublishedFeedProjects(projects: KaizenProject[]): KaizenProject[] {
  if (!Array.isArray(projects)) return [];
  return projects.filter(p => Boolean(p && p.stage === 'standardized' && p.isPublishedToFeed === true));
}

export function getKaizenLikesCount(project: Pick<KaizenProject, 'likes'>): number {
  return Array.isArray(project.likes) ? project.likes.length : 0;
}

export function computeContributorBadges(stats: {
  totalCompleted: number;
  likesReceived: number;
  replicationsReceived: number;
  totalSavings: number;
}): KaizenBadge[] {
  const badges: KaizenBadge[] = [];

  if (stats.totalCompleted >= 3) {
    badges.push({
      id: 'kaizen_master',
      label: 'Mestre Kaizen',
      icon: '🏆',
      description: '3 ou mais projetos concluídos e implementados',
      darkClass: 'bg-amber-500/20 text-amber-300 border-amber-400/35',
      lightClass: 'bg-amber-50 text-amber-700 border-amber-200'
    });
  } else if (stats.totalCompleted >= 1) {
    badges.push({
      id: 'first_delivery',
      label: 'Implementador',
      icon: '🚀',
      description: 'Projeto Kaizen entregue na prática',
      darkClass: 'bg-blue-500/20 text-blue-300 border-blue-400/35',
      lightClass: 'bg-blue-50 text-blue-700 border-blue-200'
    });
  }

  if (stats.likesReceived >= 5) {
    badges.push({
      id: 'plant_favorite',
      label: 'Destaque da Planta',
      icon: '❤️',
      description: '5 ou mais curtidas no Feed Inova',
      darkClass: 'bg-rose-500/20 text-rose-300 border-rose-400/35',
      lightClass: 'bg-rose-50 text-rose-700 border-rose-200'
    });
  }

  if (stats.replicationsReceived >= 1) {
    badges.push({
      id: 'yokoten_multiplier',
      label: 'Multiplicador Yokoten',
      icon: '🔁',
      description: 'Melhoria replicada em outra área da fábrica',
      darkClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35',
      lightClass: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    });
  }

  if (stats.totalSavings >= 50000) {
    badges.push({
      id: 'waste_hunter',
      label: 'Caçador de Desperdícios',
      icon: '💰',
      description: 'R$ 50k+ em economia anual gerada',
      darkClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35',
      lightClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    });
  }

  return badges;
}

/**
 * Constrói o Ranking Público Inova da Fábrica considerando EXCLUSIVAMENTE
 * projetos concluídos e implementados (`stage === 'standardized'`).
 * Evita "efeito vaidade" (não pontua ideias que não foram executadas).
 */
export function buildInovaLeaderboard(projects: KaizenProject[]): ContributorRanking[] {
  const completedProjects = (Array.isArray(projects) ? projects : []).filter(
    p => p && p.stage === 'standardized'
  );

  const map = new Map<
    string,
    {
      name: string;
      role: string;
      department: string;
      ledCount: number;
      participatedCount: number;
      publishedCount: number;
      likesReceived: number;
      replicationsReceived: number;
      totalPoints: number;
      totalSavingsGenerated: number;
      totalHoursSaved: number;
      completedProjects: KaizenProject[];
    }
  >();

  for (const p of completedProjects) {
    const levelPts = INOVA_LEVEL_POINTS[p.level] || 20;
    const likesCount = p.isPublishedToFeed ? getKaizenLikesCount(p) : 0;
    const replicationsCount = p.isPublishedToFeed ? p.replicationCount || 0 : 0;

    // 1. Líder do Kaizen concluído
    if (p.leaderName && p.leaderName.trim()) {
      const leaderKey = p.leaderName.trim();
      const current = map.get(leaderKey) || {
        name: leaderKey,
        role: p.leaderRole || 'Líder Kaizen',
        department: p.sector || 'Fábrica',
        ledCount: 0,
        participatedCount: 0,
        publishedCount: 0,
        likesReceived: 0,
        replicationsReceived: 0,
        totalPoints: 0,
        totalSavingsGenerated: 0,
        totalHoursSaved: 0,
        completedProjects: []
      };

      current.ledCount += 1;
      if (p.isPublishedToFeed) current.publishedCount += 1;
      current.likesReceived += likesCount;
      current.replicationsReceived += replicationsCount;
      current.totalPoints +=
        levelPts +
        INOVA_LEADERSHIP_BONUS +
        likesCount * INOVA_LIKE_POINTS +
        replicationsCount * INOVA_YOKOTEN_POINTS;
      current.totalSavingsGenerated += p.estimatedSavingsAnnual || 0;
      current.totalHoursSaved += p.hoursSavedMonthly || 0;
      current.completedProjects.push(p);

      map.set(leaderKey, current);
    }

    // 2. Participantes do time do Kaizen concluído
    const team = Array.isArray(p.teamMembers) ? p.teamMembers : [];
    const seenMembers = new Set<string>();
    for (const rawMember of team) {
      const member = (rawMember || '').trim();
      if (!member || member === p.leaderName?.trim() || seenMembers.has(member)) continue;
      seenMembers.add(member);

      const current = map.get(member) || {
        name: member,
        role: 'Coautor / Equipe Kaizen',
        department: p.sector || 'Fábrica',
        ledCount: 0,
        participatedCount: 0,
        publishedCount: 0,
        likesReceived: 0,
        replicationsReceived: 0,
        totalPoints: 0,
        totalSavingsGenerated: 0,
        totalHoursSaved: 0,
        completedProjects: []
      };

      current.participatedCount += 1;
      if (p.isPublishedToFeed) current.publishedCount += 1;
      current.likesReceived += likesCount;
      current.replicationsReceived += replicationsCount;
      current.totalPoints +=
        Math.round(levelPts * 0.5) +
        Math.round(likesCount * INOVA_LIKE_POINTS * 0.5) +
        Math.round(replicationsCount * INOVA_YOKOTEN_POINTS * 0.5);
      current.totalSavingsGenerated += Math.round((p.estimatedSavingsAnnual || 0) * 0.5);
      current.totalHoursSaved += Math.round((p.hoursSavedMonthly || 0) * 0.5);
      current.completedProjects.push(p);

      map.set(member, current);
    }
  }

  return Array.from(map.values())
    .map(entry => {
      const totalKaizens = entry.ledCount + entry.participatedCount;
      const badges = computeContributorBadges({
        totalCompleted: totalKaizens,
        likesReceived: entry.likesReceived,
        replicationsReceived: entry.replicationsReceived,
        totalSavings: entry.totalSavingsGenerated
      });

      return {
        ...entry,
        totalKaizens,
        badges
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalKaizens !== a.totalKaizens) return b.totalKaizens - a.totalKaizens;
      return b.likesReceived - a.likesReceived;
    });
}

/**
 * Ranking saudável de áreas com mais Kaizens FINALIZADOS na planta (sem expor pendências privadas).
 */
export function buildCompletedSectorLeaderboard(
  projects: KaizenProject[]
): SectorCompletedRanking[] {
  const completedProjects = (Array.isArray(projects) ? projects : []).filter(
    p => p && p.stage === 'standardized'
  );

  const map = new Map<string, SectorCompletedRanking>();

  for (const p of completedProjects) {
    const sectorName = (p.sector || 'Geral').trim();
    const current = map.get(sectorName) || {
      sector: sectorName,
      completedCount: 0,
      publishedCount: 0,
      totalLikes: 0,
      totalReplications: 0,
      totalSavings: 0,
      totalHoursSaved: 0
    };

    current.completedCount += 1;
    if (p.isPublishedToFeed) {
      current.publishedCount += 1;
      current.totalLikes += getKaizenLikesCount(p);
      current.totalReplications += p.replicationCount || 0;
    }
    current.totalSavings += p.estimatedSavingsAnnual || 0;
    current.totalHoursSaved += p.hoursSavedMonthly || 0;

    map.set(sectorName, current);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
    return b.totalLikes - a.totalLikes;
  });
}
