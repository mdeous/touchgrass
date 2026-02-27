import type { Region } from '@/engine/types'

export interface RegionInfo {
  readonly id: Region
  readonly label: string
  readonly description: string
}

export const REGIONS: readonly RegionInfo[] = [
  { id: 'metropolitan', label: 'France métropolitaine', description: '11 jours fériés nationaux' },
  { id: 'alsace-moselle', label: 'Alsace-Moselle', description: '13 jours fériés (+ Vendredi Saint, Saint-Étienne)' },
  { id: 'guadeloupe', label: 'Guadeloupe', description: '13 jours fériés (+ abolition, Schœlcher)' },
  { id: 'martinique', label: 'Martinique', description: '13 jours fériés (+ abolition, Schœlcher)' },
  { id: 'guyane', label: 'Guyane', description: '12 jours fériés (+ abolition)' },
  { id: 'reunion', label: 'La Réunion', description: '12 jours fériés (+ abolition)' },
  { id: 'mayotte', label: 'Mayotte', description: '12 jours fériés (+ abolition)' },
]
