import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { groupAllocations, generateTimeOffSummary } from '@/export/text-summary'
import type { Allocation } from '@/engine/types'

interface TimeOffSummaryProps {
  readonly allocations: readonly Allocation[]
}

export function TimeOffSummary({ allocations }: TimeOffSummaryProps) {
  const groups = groupAllocations(allocations)

  if (groups.length === 0) return null

  const handleCopy = async () => {
    try {
      const text = generateTimeOffSummary(allocations)
      await navigator.clipboard.writeText(text)
      toast.success('Time off summary copied to clipboard')
    } catch {
      toast.error('Failed to copy summary')
    }
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="time-off-summary" className="border rounded-lg px-4">
        <AccordionTrigger className="text-sm font-medium">
          Time off summary
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.leaveType} className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {group.leaveType.toUpperCase()} days to request ({group.count} day{group.count !== 1 ? 's' : ''})
                </p>
                <div className="flex flex-col gap-0.5 pl-3">
                  {group.lines.map((line) => (
                    <span key={line} className="text-sm">{line}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
