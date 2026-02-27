import { format } from "date-fns";
import type { Bridge, OptimizationResult } from "@/engine/types";

function formatBridge(bridge: Bridge): string {
  const name = bridge.pontName ? `Pont: ${bridge.pontName}` : "PTO Break";
  const start = format(bridge.startDate, "MMM d");
  const end = format(bridge.endDate, "MMM d, yyyy");
  const eff = Number.isInteger(bridge.efficiency)
    ? String(bridge.efficiency)
    : bridge.efficiency.toFixed(1);

  return [
    `${name}`,
    `  ${start} - ${end}`,
    `  ${bridge.totalDaysOff} days off, ${bridge.ptoCost} PTO day${bridge.ptoCost !== 1 ? "s" : ""} (${eff}:1 efficiency)`,
  ].join("\n");
}

export function generateTextSummary(
  result: OptimizationResult,
  year: number,
): string {
  const header = `TouchGrass PTO Plan ${year}`;
  const separator = "=".repeat(header.length);

  const bridges = result.selectedBridges.map(formatBridge).join("\n\n");

  const totals = [
    "",
    "-".repeat(30),
    `Total days off: ${result.totalDaysOff}`,
    `CP used: ${result.cpUsed}`,
    `RTT used: ${result.rttUsed}`,
    `Average efficiency: ${Number.isInteger(result.averageEfficiency) ? result.averageEfficiency : result.averageEfficiency.toFixed(1)}:1`,
    `Number of breaks: ${result.selectedBridges.length}`,
  ].join("\n");

  return [header, separator, "", bridges, totals, ""].join("\n");
}
