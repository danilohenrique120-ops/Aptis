import type {
  EmployeeSkillRecord,
  Sector,
  SkillLevel,
  SkillStation,
  SkillType
} from './types';

export function getEffectiveSkillType(station: Pick<SkillStation, 'skillType'>): SkillType {
  return station.skillType || 'hard_station';
}

export function isCriticalStation(
  station: Pick<SkillStation, 'skillType' | 'isCriticalForLineStop'>
): boolean {
  if (typeof station.isCriticalForLineStop === 'boolean') {
    return station.isCriticalForLineStop;
  }
  return getEffectiveSkillType(station) !== 'soft_skill';
}

export function normalizeSkillName(name: string): string {
  return (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSkillTypeMeta(skillType: SkillType): {
  label: string;
  shortLabel: string;
  darkBadge: string;
  lightBadge: string;
} {
  switch (skillType) {
    case 'hard_skill':
      return {
        label: 'Hard Skill Técnica',
        shortLabel: 'HARD',
        darkBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/35',
        lightBadge: 'bg-cyan-50 text-cyan-700 border-cyan-200'
      };
    case 'soft_skill':
      return {
        label: 'Soft Skill / Comportamental',
        shortLabel: 'SOFT',
        darkBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/35',
        lightBadge: 'bg-purple-50 text-purple-700 border-purple-200'
      };
    case 'hard_station':
    default:
      return {
        label: 'Posto / Equipamento',
        shortLabel: 'POSTO',
        darkBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/35',
        lightBadge: 'bg-blue-50 text-blue-700 border-blue-200'
      };
  }
}

export interface PlantSkillCatalogEntry {
  normalizedName: string;
  displayName: string;
  skillType: SkillType;
  category: string;
  sectorCodes: string[];
  sectorCount: number;
}

/**
 * Gera catálogo sanitizado de habilidades cadastradas na planta (sem expor notas ou gaps).
 * Usado para autocomplete anti-duplicidade quando o gestor cadastra uma nova competência.
 */
export function buildPlantSkillCatalog(
  stations: SkillStation[],
  sectors: Sector[]
): PlantSkillCatalogEntry[] {
  const sectorMap = new Map(sectors.map(s => [s.id, s]));
  const grouped = new Map<
    string,
    {
      displayName: string;
      skillType: SkillType;
      category: string;
      sectorCodes: Set<string>;
    }
  >();

  for (const st of stations) {
    if (!st?.name) continue;
    const norm = normalizeSkillName(st.name);
    if (!norm) continue;

    const sectorCode = sectorMap.get(st.sectorId)?.code || 'PLANTA';
    const existing = grouped.get(norm);
    if (existing) {
      existing.sectorCodes.add(sectorCode);
    } else {
      grouped.set(norm, {
        displayName: st.name.trim(),
        skillType: getEffectiveSkillType(st),
        category: st.category || 'Geral',
        sectorCodes: new Set([sectorCode])
      });
    }
  }

  return Array.from(grouped.entries())
    .map(([normalizedName, value]) => ({
      normalizedName,
      displayName: value.displayName,
      skillType: value.skillType,
      category: value.category,
      sectorCodes: Array.from(value.sectorCodes),
      sectorCount: value.sectorCodes.size
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
}

export interface PlantTrainerEntry {
  key: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  shift: string;
  sectorId: string;
  sectorCode: string;
  sectorName: string;
  sectorColor: string;
  stationId: string;
  stationName: string;
  normalizedSkillName: string;
  category: string;
  skillType: SkillType;
  level: SkillLevel; // Apenas 3 ou 4
}

/**
 * Constrói o índice público interno da planta contendo APENAS Multiplicadores (N4) e Autônomos (N3).
 * Nunca expõe N1/N2, déficits ou sucessão de outros setores.
 */
export function buildPlantTrainersIndex(
  stations: SkillStation[],
  employees: EmployeeSkillRecord[],
  sectors: Sector[],
  minLevel: 3 | 4 = 3
): PlantTrainerEntry[] {
  const stationMap = new Map(stations.map(s => [s.id, s]));
  const sectorMap = new Map(sectors.map(s => [s.id, s]));
  const entries: PlantTrainerEntry[] = [];

  for (const emp of employees) {
    if (!emp || !emp.skills) continue;
    const empSector = sectorMap.get(emp.sectorId);

    for (const [stationId, rawLevel] of Object.entries(emp.skills)) {
      const level = Number(rawLevel) as SkillLevel;
      if (level < minLevel) continue;

      const station = stationMap.get(stationId);
      if (!station) continue;

      const stationSector = sectorMap.get(station.sectorId) || empSector;

      entries.push({
        key: `${emp.employeeId}::${station.id}`,
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        employeeRole: emp.role,
        shift: emp.shift,
        sectorId: stationSector?.id || emp.sectorId,
        sectorCode: stationSector?.code || 'PLANTA',
        sectorName: stationSector?.name || 'Área Fabril',
        sectorColor: stationSector?.color || 'from-blue-600 to-indigo-600',
        stationId: station.id,
        stationName: station.name,
        normalizedSkillName: normalizeSkillName(station.name),
        category: station.category || 'Geral',
        skillType: getEffectiveSkillType(station),
        level
      });
    }
  }

  return entries.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return a.employeeName.localeCompare(b.employeeName, 'pt-BR');
  });
}

function tokenizeSkillWords(normalizedName: string): string[] {
  const stopWords = new Set(['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'para', 'com', 'a', 'o', 'celula', 'posto']);
  return normalizedName
    .split(/[\s\-_/()]+/)
    .filter(w => w.length >= 3 && !stopWords.has(w));
}

export interface CrossSectorTrainerMatch extends PlantTrainerEntry {
  matchQuality: 'exact' | 'related' | 'other_plant';
}

/**
 * Encontra treinadores N4 (ou N3) em OUTROS setores da mesma fábrica para apoiar um posto/habilidade com gap.
 */
export function findCrossSectorTrainers(
  targetStation: SkillStation,
  activeSectorId: string,
  allStations: SkillStation[],
  allEmployees: EmployeeSkillRecord[],
  sectors: Sector[]
): CrossSectorTrainerMatch[] {
  const targetNorm = normalizeSkillName(targetStation.name);
  const targetCatNorm = normalizeSkillName(targetStation.category || '');
  const targetTokens = tokenizeSkillWords(targetNorm);

  // Primeiro prioriza N4 de outros setores
  const allExperts = buildPlantTrainersIndex(allStations, allEmployees, sectors, 4).filter(
    t => t.sectorId !== activeSectorId
  );

  const ranked: CrossSectorTrainerMatch[] = allExperts.map(trainer => {
    let matchQuality: CrossSectorTrainerMatch['matchQuality'] = 'other_plant';
    if (trainer.normalizedSkillName === targetNorm) {
      matchQuality = 'exact';
    } else {
      const trainerTokens = tokenizeSkillWords(trainer.normalizedSkillName);
      const sharedTokens = targetTokens.filter(t => trainerTokens.includes(t));
      const sameCategory =
        targetCatNorm.length >= 3 && normalizeSkillName(trainer.category) === targetCatNorm;
      if (sharedTokens.length > 0 || sameCategory) {
        matchQuality = 'related';
      }
    }

    return {
      ...trainer,
      matchQuality
    };
  });

  const priorityOrder = { exact: 0, related: 1, other_plant: 2 };
  return ranked.sort((a, b) => {
    const diff = priorityOrder[a.matchQuality] - priorityOrder[b.matchQuality];
    if (diff !== 0) return diff;
    return a.employeeName.localeCompare(b.employeeName, 'pt-BR');
  });
}
