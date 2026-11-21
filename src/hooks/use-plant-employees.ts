'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTenant } from '@/context/tenant-context';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { supabase } from '@/lib/supabase';
import { INITIAL_EMPLOYEES } from '@/modules/skills-matrix/mock-data';
import { INITIAL_PDIS } from '@/modules/pdi-manager/mock-data';
import { EmployeeSkillRecord } from '@/modules/skills-matrix/types';
import { TrainingRecord } from '@/modules/training-matrix/types';
import { TeamMember1on1 } from '@/modules/one-on-one/types';
import { EmployeePdi } from '@/modules/pdi-manager/types';
import {
  buildUnifiedEmployeeDirectory,
  getMissingEmployeesForModule,
  EmployeeModuleSource,
  UnifiedPlantEmployee
} from '@/lib/unified-employee-directory';

function parseStoredArray<T>(raw: string | null, fallback: T[] = []): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export interface UsePlantEmployeesOptions {
  currentModule?: EmployeeModuleSource;
  existingNamesInModule?: string[];
  allowedSectorIds?: string[];
  allowedDepartmentNames?: string[];
  liveSkillsEmployees?: EmployeeSkillRecord[];
  liveTrainingRecords?: TrainingRecord[];
  liveOneOnOneMembers?: TeamMember1on1[];
  livePdiRecords?: EmployeePdi[];
}

export function usePlantEmployees(options: UsePlantEmployeesOptions = {}) {
  const { currentTenant } = useTenant();
  const { sectors } = usePlantSectors();
  const tenantId = currentTenant?.id || 'tenant-dhp';
  const isDemoTenant = tenantId === 'tenant-dhp' || tenantId === 'dhp-enterprise';

  const [refreshTick, setRefreshTick] = useState(0);
  const [cloudSnapshots, setCloudSnapshots] = useState<{
    tenantId: string;
    skillsEmployees?: EmployeeSkillRecord[];
    trainingRecords?: TrainingRecord[];
    oneOnOneMembers?: TeamMember1on1[];
    pdiRecords?: EmployeePdi[];
  } | null>(null);

  const refreshDirectory = useCallback(() => {
    setRefreshTick(prev => prev + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function fetchCrossModuleEmployees() {
      try {
        const rowIds = [
          `${tenantId}:skills-matrix:employees`,
          `${tenantId}:training-matrix:trainings`,
          `${tenantId}:one-on-one:members`,
          `${tenantId}:pdi-manager:pdis`
        ];
        const { data, error } = await supabase
          .from('tenant_tool_data')
          .select('id, data')
          .in('id', rowIds);

        if (error || isCancelled || !data) return;

        const next: {
          tenantId: string;
          skillsEmployees?: EmployeeSkillRecord[];
          trainingRecords?: TrainingRecord[];
          oneOnOneMembers?: TeamMember1on1[];
          pdiRecords?: EmployeePdi[];
        } = { tenantId };

        for (const row of data) {
          if (!Array.isArray(row.data)) continue;
          if (row.id.endsWith(':skills-matrix:employees')) {
            next.skillsEmployees = row.data as EmployeeSkillRecord[];
          } else if (row.id.endsWith(':training-matrix:trainings')) {
            next.trainingRecords = row.data as TrainingRecord[];
          } else if (row.id.endsWith(':one-on-one:members')) {
            next.oneOnOneMembers = row.data as TeamMember1on1[];
          } else if (row.id.endsWith(':pdi-manager:pdis')) {
            next.pdiRecords = row.data as EmployeePdi[];
          }
        }

        if (!isCancelled) {
          setCloudSnapshots(next);
        }
      } catch {
        // Fallback silencioso para cache local
      }
    }

    fetchCrossModuleEmployees();
    return () => {
      isCancelled = true;
    };
  }, [tenantId, refreshTick]);

  const directory = useMemo<UnifiedPlantEmployee[]>(() => {
    const activeCloud = cloudSnapshots?.tenantId === tenantId ? cloudSnapshots : null;

    const localSkills =
      typeof window !== 'undefined'
        ? parseStoredArray<EmployeeSkillRecord>(
            localStorage.getItem(`aptis_${tenantId}_skills-matrix_employees`),
            isDemoTenant ? INITIAL_EMPLOYEES : []
          )
        : isDemoTenant
        ? INITIAL_EMPLOYEES
        : [];

    const localTrainings =
      typeof window !== 'undefined'
        ? parseStoredArray<TrainingRecord>(
            localStorage.getItem(`aptis_${tenantId}_training-matrix_trainings`)
          )
        : [];

    const localMembers =
      typeof window !== 'undefined'
        ? parseStoredArray<TeamMember1on1>(
            localStorage.getItem(`aptis_${tenantId}_one-on-one_members`)
          )
        : [];

    const localPdis =
      typeof window !== 'undefined'
        ? parseStoredArray<EmployeePdi>(
            localStorage.getItem(`aptis_${tenantId}_pdi-manager_pdis`),
            isDemoTenant ? INITIAL_PDIS : []
          )
        : isDemoTenant
        ? INITIAL_PDIS
        : [];

    const skillsEmployees =
      options.liveSkillsEmployees ?? activeCloud?.skillsEmployees ?? localSkills;
    const trainingRecords =
      options.liveTrainingRecords ?? activeCloud?.trainingRecords ?? localTrainings;
    const oneOnOneMembers =
      options.liveOneOnOneMembers ?? activeCloud?.oneOnOneMembers ?? localMembers;
    const pdiRecords =
      options.livePdiRecords ?? activeCloud?.pdiRecords ?? localPdis;

    return buildUnifiedEmployeeDirectory({
      skillsEmployees,
      trainingRecords,
      oneOnOneMembers,
      pdiRecords,
      sectors
    });
  }, [
    tenantId,
    isDemoTenant,
    cloudSnapshots,
    sectors,
    options.liveSkillsEmployees,
    options.liveTrainingRecords,
    options.liveOneOnOneMembers,
    options.livePdiRecords
  ]);

  const missingForModule = useMemo<UnifiedPlantEmployee[]>(() => {
    if (!options.currentModule) return [];
    return getMissingEmployeesForModule({
      directory,
      targetModule: options.currentModule,
      existingNamesInModule: options.existingNamesInModule,
      allowedSectorIds: options.allowedSectorIds,
      allowedDepartmentNames: options.allowedDepartmentNames
    });
  }, [
    directory,
    options.currentModule,
    options.existingNamesInModule,
    options.allowedSectorIds,
    options.allowedDepartmentNames
  ]);

  return {
    directory,
    missingForModule,
    refreshDirectory
  };
}
