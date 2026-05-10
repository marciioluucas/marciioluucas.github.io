import vehiclesJson from '../data/vehicles.json';
import type { StoredVehicle } from './storage';

export type Vehicle = StoredVehicle;

export const vehicles: Record<string, Vehicle> = vehiclesJson as Record<string, Vehicle>;

export const DEFAULT_SLUG = 'civic-2018';

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles[slug];
}

export function listVehicles(): Vehicle[] {
  return Object.values(vehicles);
}

export function vehicleTitle(v: Vehicle): string {
  return `${v.marca} ${v.modelo} ${v.ano}`;
}
