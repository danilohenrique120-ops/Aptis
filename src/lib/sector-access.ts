import type { User } from '@/types';
import type { PlantSector } from '@/types/sectors';
import type { Sector } from '@/modules/skills-matrix/types';

export function isPlantAdminUser(user?: User | null): boolean {
  if (!user) return false;
  return user.role === 'superadmin' || user.role === 'tenant_admin';
}

export function getAccessibleSectors<
  T extends Pick<Sector | PlantSector, 'id' | 'code' | 'name'>
>(sectors: T[], user?: User | null): T[] {
  if (!user) return [];
  if (isPlantAdminUser(user)) return sectors;

  const allowedIds = Array.isArray(user.allowedSectorIds) ? user.allowedSectorIds : [];
  if (allowedIds.length > 0) {
    const allowedSet = new Set(allowedIds);
    return sectors.filter(s => allowedSet.has(s.id));
  }

  if (user.department && user.department.trim().length > 0) {
    const deptLower = user.department.trim().toLowerCase();
    return sectors.filter(
      s =>
        s.id.toLowerCase() === deptLower ||
        s.code.toLowerCase() === deptLower ||
        s.name.toLowerCase() === deptLower
    );
  }

  return [];
}

export function canAccessSector(
  sectorId: string,
  user?: User | null,
  sectors: Array<Pick<Sector | PlantSector, 'id' | 'code' | 'name'>> = []
): boolean {
  if (!user) return false;
  if (isPlantAdminUser(user)) return true;
  return getAccessibleSectors(sectors, user).some(s => s.id === sectorId);
}
