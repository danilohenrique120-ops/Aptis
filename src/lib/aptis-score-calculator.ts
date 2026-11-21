import type { SkillStation, EmployeeSkillRecord } from '../modules/skills-matrix/types';
import type { TrainingRecord } from '../modules/training-matrix/types';

function isCriticalSkillStation(station: SkillStation): boolean {
  if (typeof station.isCriticalForLineStop === 'boolean') {
    return station.isCriticalForLineStop;
  }
  return station.skillType !== 'soft_skill';
}

export interface AptisScoreBreakdown {
  aptisScore: number;
  aptisCompliance: number;
  aptisSkills: number;
  validTrainingsCount: number;
  totalTrainingsCount: number;
  coveredStationsCount: number;
  totalCriticalStationsCount: number;
  readinessLabel: 'Planta Apta' | 'Atenção Operacional' | 'Risco de Bloqueio';
  readinessTone: 'emerald' | 'amber' | 'rose';
}

export function calculateDynamicAptisScore(params: {
  trainings: TrainingRecord[];
  stations: SkillStation[];
  employees: EmployeeSkillRecord[];
  todayIso?: string;
}): AptisScoreBreakdown {
  const todayIso = params.todayIso || new Date().toISOString().split('T')[0];
  const trainings = Array.isArray(params.trainings) ? params.trainings : [];
  const stations = Array.isArray(params.stations) ? params.stations : [];
  const employees = Array.isArray(params.employees) ? params.employees : [];

  // 1. Aptidão Legal (Aptis Compliance / training-matrix): % de NRs/POPs vigentes (não vencidos)
  let aptisCompliance = 100;
  let validTrainingsCount = 0;
  const totalTrainingsCount = trainings.length;

  if (totalTrainingsCount > 0) {
    validTrainingsCount = trainings.filter(t => {
      if (t.expiryDate) {
        return t.expiryDate >= todayIso;
      }
      return true;
    }).length;
    aptisCompliance = Math.round((validTrainingsCount / totalTrainingsCount) * 100);
  }

  // 2. Aptidão Técnica (Aptis Skills / skills-matrix): % de postos críticos cobertos por nível U (3) ou O (4)
  let aptisSkills = 100;
  let coveredStationsCount = 0;
  const criticalStations = stations.filter(st => isCriticalSkillStation(st));
  const targetStations = criticalStations.length > 0 ? criticalStations : stations;
  const totalCriticalStationsCount = targetStations.length;

  if (totalCriticalStationsCount > 0 && employees.length > 0) {
    let totalCoverageRatio = 0;

    for (const st of targetStations) {
      const req = Math.max(st.minOperatorsRequired || 1, 1);
      const sectorEmployees = st.sectorId
        ? employees.filter(e => !e.sectorId || e.sectorId === st.sectorId)
        : employees;
      const pool = sectorEmployees.length > 0 ? sectorEmployees : employees;

      const autonomousOperators = pool.filter(emp => (emp.skills?.[st.id] ?? 0) >= 3).length;
      if (autonomousOperators >= req) {
        coveredStationsCount += 1;
      }
      totalCoverageRatio += Math.min(autonomousOperators / req, 1);
    }

    aptisSkills = Math.round((totalCoverageRatio / totalCriticalStationsCount) * 100);
  }

  // 3. Índice Global (The Aptis Score): Composto exclusivamente por Aptis Compliance e Aptis Skills
  const aptisScore = Math.round((aptisCompliance + aptisSkills) / 2);

  const readinessLabel: AptisScoreBreakdown['readinessLabel'] =
    aptisScore >= 85
      ? 'Planta Apta'
      : aptisScore >= 70
      ? 'Atenção Operacional'
      : 'Risco de Bloqueio';

  const readinessTone: AptisScoreBreakdown['readinessTone'] =
    aptisScore >= 85 ? 'emerald' : aptisScore >= 70 ? 'amber' : 'rose';

  return {
    aptisScore,
    aptisCompliance,
    aptisSkills,
    validTrainingsCount,
    totalTrainingsCount,
    coveredStationsCount,
    totalCriticalStationsCount,
    readinessLabel,
    readinessTone
  };
}
