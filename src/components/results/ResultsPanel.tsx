import { SummaryStats } from "@/components/results/SummaryStats";
import { TimeOffSummary } from "@/components/results/TimeOffSummary";
import { ClusterCard } from "@/components/results/ClusterCard";
import { ExportActions } from "@/components/results/ExportActions";
import type { OptimizationResult, AppConfig, Bridge } from "@/engine/types";

interface ResultsPanelProps {
  readonly result: OptimizationResult;
  readonly config: AppConfig;
  readonly allBridges: readonly Bridge[];
  readonly onBridgeHover?: (bridgeId: string | null) => void;
}

function getUniquePonts(bridges: readonly Bridge[]): Bridge[] {
  const seen = new Set<string>();
  const unique: Bridge[] = [];
  for (const b of bridges) {
    if (!b.pontName || seen.has(b.pontName)) continue;
    seen.add(b.pontName);
    unique.push(b);
  }
  return unique;
}

export function ResultsPanel({
  result,
  config,
  allBridges,
  onBridgeHover,
}: ResultsPanelProps) {
  const ponts = getUniquePonts(allBridges);
  const disabledSet = new Set(config.disabledBridges);
  const selectedSet = new Set(result.selectedBridges.map((b) => b.pontName));

  if (ponts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
        <p className="text-sm">No optimization results yet.</p>
        <p className="text-xs">Configure your PTO budget to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Optimization Results</h2>
        <ExportActions result={result} config={config} />
      </div>
      <SummaryStats
        result={result}
        ptoBudget={config.ptoBudget}
        recoveryBudget={config.recoveryBudget}
        country={config.country}
      />
      <TimeOffSummary allocations={result.allocations} country={config.country} />
      <div className="flex flex-col gap-2">
        {ponts.map((bridge) => {
          const isDisabled = disabledSet.has(bridge.pontName!);
          const isSelected = selectedSet.has(bridge.pontName);
          return (
            <ClusterCard
              key={bridge.id}
              bridge={bridge}
              disabled={isDisabled}
              selected={isSelected}
              onHover={onBridgeHover}
            />
          );
        })}
      </div>
    </div>
  );
}
