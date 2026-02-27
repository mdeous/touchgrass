import { ScrollArea } from '@/components/ui/scroll-area'
import { SummaryStats } from '@/components/results/SummaryStats'
import { ClusterCard } from '@/components/results/ClusterCard'
import { ExportActions } from '@/components/results/ExportActions'
import type { OptimizationResult, AppConfig } from '@/engine/types'

interface ResultsPanelProps {
  readonly result: OptimizationResult
  readonly config: AppConfig
  readonly onBridgeHover?: (bridgeId: string | null) => void
}

export function ResultsPanel({ result, config, onBridgeHover }: ResultsPanelProps) {
  if (result.selectedBridges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <p className="text-sm">No optimization results yet.</p>
        <p className="text-xs">Configure your PTO budget to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Optimization Results</h2>
        <ExportActions result={result} config={config} />
      </div>
      <SummaryStats
        result={result}
        cpBudget={config.cpBudget}
        rttBudget={config.rttBudget}
      />
      <ScrollArea className="max-h-[400px]">
        <div className="flex flex-col gap-2 pr-3">
          {result.selectedBridges.map((bridge) => (
            <ClusterCard
              key={bridge.id}
              bridge={bridge}
              onHover={onBridgeHover}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
