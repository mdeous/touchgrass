import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { REGIONS } from '@/data/regions'

export function RegionSelector() {
  const region = useAppStore((s) => s.region)
  const setRegion = useAppStore((s) => s.setRegion)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="region-select">Region</Label>
      <Select value={region} onValueChange={setRegion}>
        <SelectTrigger id="region-select" className="w-full">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          {REGIONS.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              <div className="flex flex-col">
                <span>{r.label}</span>
                <span className="text-xs text-muted-foreground">
                  {r.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
