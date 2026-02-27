import { useState } from 'react'
import { format, parse } from 'date-fns'
import { CalendarCheck, X } from 'lucide-react'
import type { LeaveType } from '@/engine/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'

const DATE_FORMAT = 'yyyy-MM-dd'

function toDateKey(date: Date): string {
  return format(date, DATE_FORMAT)
}

function fromDateKey(key: string): Date {
  return parse(key, DATE_FORMAT, new Date())
}

export function PreBookedPicker() {
  const preBookedDates = useAppStore((s) => s.preBookedDates)
  const preBookedTypes = useAppStore((s) => s.preBookedTypes)
  const addPreBookedDate = useAppStore((s) => s.addPreBookedDate)
  const removePreBookedDate = useAppStore((s) => s.removePreBookedDate)
  const [leaveType, setLeaveType] = useState<LeaveType>('cp')

  const selectedDates = preBookedDates.map(fromDateKey)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Pre-booked Days</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <CalendarCheck className="size-3.5" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <span className="text-xs text-muted-foreground">Type:</span>
              <Select
                value={leaveType}
                onValueChange={(v) => setLeaveType(v as LeaveType)}
              >
                <SelectTrigger size="sm" className="h-7 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cp">CP</SelectItem>
                  <SelectItem value="rtt">RTT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => {
                if (!dates) return
                const newKeys = new Set(dates.map(toDateKey))
                const oldKeys = new Set(preBookedDates)
                for (const key of newKeys) {
                  if (!oldKeys.has(key)) addPreBookedDate(key, leaveType)
                }
                for (const key of oldKeys) {
                  if (!newKeys.has(key)) removePreBookedDate(key)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-xs text-muted-foreground">
        Days already booked off — the optimizer will work around them.
      </p>

      {preBookedDates.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {[...preBookedDates].sort().map((dateKey) => (
            <Badge key={dateKey} variant="outline" className="gap-1 pr-1">
              {format(fromDateKey(dateKey), 'MMM d')}
              <span className="text-xs font-semibold uppercase text-primary">
                {preBookedTypes[dateKey] ?? 'cp'}
              </span>
              <button
                type="button"
                onClick={() => removePreBookedDate(dateKey)}
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`Remove ${dateKey}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
