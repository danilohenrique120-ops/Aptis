import type { EmployeeSkillRecord } from '../modules/skills-matrix/types';
import type { TrainingRecord } from '../modules/training-matrix/types';
import type { TeamMember1on1 } from '../modules/one-on-one/types';
import type { EmployeePdi } from '../modules/pdi-manager/types';
import type { PlantSector } from '../types/sectors';

export type EmployeeModuleSource =
  | 'skills-matrix'
  | 'training-matrix'
  | 'one-on-one'
  | 'pdi-manager';

export interface UnifiedPlantEmployee {
  key: string;
  name: string;
  role: string;
  department: string;
  sectorId: string;
  shift: '1º Turno' | '2º Turno' | '3º Turno';
  sources: EmployeeModuleSource[];
}

export function normalizeEmployeeKey(rawName: string): string {
  return (rawName || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function normalizeShift(raw?: string): '1º Turno' | '2º Turno' | '3º Turno' {
  if (!raw) return '1º Turno';
  if (raw.includes('2')) return '2º Turno';
  if (raw.includes('3')) return '3º Turno';
  return '1º Turno';
}

export function buildUnifiedEmployeeDirectory(params: {
  skillsEmployees?: EmployeeSkillRecord[];
  trainingRecords?: TrainingRecord[];
  oneOnOneMembers?: TeamMember1on1[];
  pdiRecords?: EmployeePdi[];
  sectors?: PlantSector[];
}): UnifiedPlantEmployee[] {
  const sectors = params.sectors || [];
  const defaultSector = sectors[0] || { id: 'sec-usinagem', name: 'Usinagem CNC' };

  const resolveSectorPair = (inputSectorId?: string, inputDepartment?: string) => {
    if (inputSectorId) {
      const foundById = sectors.find(s => s.id === inputSectorId);
      if (foundById) {
        return { sectorId: foundById.id, department: foundById.name };
      }
    }
    if (inputDepartment) {
      const normDept = normalizeEmployeeKey(inputDepartment);
      const foundByName = sectors.find(
        s =>
          normalizeEmployeeKey(s.name) === normDept ||
          normalizeEmployeeKey(s.name).includes(normDept) ||
          normDept.includes(normalizeEmployeeKey(s.name))
      );
      if (foundByName) {
        return { sectorId: foundByName.id, department: foundByName.name };
      }
      return { sectorId: inputSectorId || defaultSector.id, department: inputDepartment };
    }
    return { sectorId: defaultSector.id, department: defaultSector.name };
  };

  const map = new Map<string, UnifiedPlantEmployee>();

  const upsert = (entry: {
    name: string;
    role?: string;
    sectorId?: string;
    department?: string;
    shift?: string;
    source: EmployeeModuleSource;
  }) => {
    const cleanName = (entry.name || '').trim();
    if (!cleanName) return;
    const key = normalizeEmployeeKey(cleanName);
    if (!key) return;

    const resolved = resolveSectorPair(entry.sectorId, entry.department);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        key,
        name: cleanName,
        role: (entry.role || 'Operador Industrial').trim(),
        department: resolved.department,
        sectorId: resolved.sectorId,
        shift: normalizeShift(entry.shift),
        sources: [entry.source]
      });
      return;
    }

    if (!existing.sources.includes(entry.source)) {
      existing.sources.push(entry.source);
    }
    if (
      (!existing.role || existing.role === 'Operador Industrial' || existing.role === 'Colaborador') &&
      entry.role
    ) {
      existing.role = entry.role.trim();
    }
    if (entry.sectorId && (!existing.sectorId || existing.sectorId === defaultSector.id)) {
      existing.sectorId = resolved.sectorId;
      existing.department = resolved.department;
    } else if (entry.department && (!existing.department || existing.department === defaultSector.name)) {
      existing.department = resolved.department;
      existing.sectorId = resolved.sectorId;
    }
    if (entry.shift && existing.shift === '1º Turno') {
      existing.shift = normalizeShift(entry.shift);
    }
  };

  // 1. Aptis Skills (skills-matrix)
  for (const emp of params.skillsEmployees || []) {
    upsert({
      name: emp.employeeName,
      role: emp.role,
      sectorId: emp.sectorId,
      shift: emp.shift,
      source: 'skills-matrix'
    });
  }

  // 2. Aptis Compliance (training-matrix)
  for (const rec of params.trainingRecords || []) {
    upsert({
      name: rec.employeeName,
      role: rec.employeeRole,
      department: rec.department,
      source: 'training-matrix'
    });
  }

  // 3. Aptis 1:1 (one-on-one)
  for (const mem of params.oneOnOneMembers || []) {
    upsert({
      name: mem.name,
      role: mem.role,
      department: mem.department,
      source: 'one-on-one'
    });
  }

  // 4. Aptis PDI (pdi-manager)
  for (const pdi of params.pdiRecords || []) {
    upsert({
      name: pdi.employeeName,
      role: pdi.employeeRole,
      department: pdi.department,
      shift: pdi.shift,
      source: 'pdi-manager'
    });
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function getMissingEmployeesForModule(params: {
  directory: UnifiedPlantEmployee[];
  targetModule: EmployeeModuleSource;
  existingNamesInModule?: string[];
  allowedSectorIds?: string[];
  allowedDepartmentNames?: string[];
}): UnifiedPlantEmployee[] {
  const existingKeys = new Set(
    (params.existingNamesInModule || []).map(n => normalizeEmployeeKey(n)).filter(Boolean)
  );

  const hasSectorIdFilter =
    Array.isArray(params.allowedSectorIds) && params.allowedSectorIds.length > 0;
  const allowedIdsSet = new Set(params.allowedSectorIds || []);

  const hasDeptFilter =
    Array.isArray(params.allowedDepartmentNames) && params.allowedDepartmentNames.length > 0;
  const allowedDeptKeys = new Set(
    (params.allowedDepartmentNames || []).map(d => normalizeEmployeeKey(d))
  );

  return params.directory.filter(emp => {
    if (existingKeys.has(emp.key) || emp.sources.includes(params.targetModule)) {
      return false;
    }
    if (hasSectorIdFilter && emp.sectorId && !allowedIdsSet.has(emp.sectorId)) {
      return false;
    }
    if (hasDeptFilter && emp.department && !allowedDeptKeys.has(normalizeEmployeeKey(emp.department))) {
      return false;
    }
    return true;
  });
}

export const MODULE_SOURCE_LABELS: Record<
  EmployeeModuleSource,
  { short: string; full: string; badgeClass: string }
> = {
  'skills-matrix': {
    short: 'Skills ILUO',
    full: 'Aptis Skills (Matriz ILUO)',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
  },
  'training-matrix': {
    short: 'Compliance NRs',
    full: 'Aptis Compliance (NRs & POPs)',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/30'
  },
  'one-on-one': {
    short: 'Liderança 1:1',
    full: 'Aptis 1:1 (Feedback & Rituais)',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-400/30'
  },
  'pdi-manager': {
    short: 'PDI 70-20-10',
    full: 'Aptis PDI (Carreira & Sucessão)',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
  }
};
