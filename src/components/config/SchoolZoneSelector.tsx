import type { SchoolZone } from '@/engine/types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'

const ZONES: { value: SchoolZone; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'A', label: 'Zone A' },
  { value: 'B', label: 'Zone B' },
  { value: 'C', label: 'Zone C' },
]

export function SchoolZoneSelector() {
  const schoolZone = useAppStore((s) => s.schoolZone)
  const setSchoolZone = useAppStore((s) => s.setSchoolZone)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="zone-select">School Zone</Label>
      <Select value={schoolZone} onValueChange={setSchoolZone}>
        <SelectTrigger id="zone-select" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ZONES.map((z) => (
            <SelectItem key={z.value} value={z.value}>
              {z.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Highlights school vacation periods to help plan family-friendly breaks.
      </p>
    </div>
  )
}
