import { Download, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadIcs } from "@/export/ics-generator";
import { generateTextSummary } from "@/export/text-summary";
import { encodeConfig } from "@/export/url-encoder";
import type { OptimizationResult, AppConfig } from "@/engine/types";
import { getCountryMeta } from "@/data/country-meta";

interface ExportActionsProps {
  readonly result: OptimizationResult;
  readonly config: AppConfig;
}

export function ExportActions({ result, config }: ExportActionsProps) {
  const meta = getCountryMeta(config.country);

  const handleDownloadIcs = () => {
    try {
      downloadIcs(result, config.year);
      toast.success("Calendar file downloaded");
    } catch {
      toast.error("Failed to generate calendar file");
    }
  };

  const handleCopySummary = async () => {
    try {
      const text = generateTextSummary(result, config.year, meta);
      await navigator.clipboard.writeText(text);
      toast.success("Summary copied to clipboard");
    } catch {
      toast.error("Failed to copy summary");
    }
  };

  const handleShareLink = async () => {
    try {
      const hash = encodeConfig(config);
      const url = `${window.location.origin}${window.location.pathname}#${hash}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Failed to generate share link");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleDownloadIcs}>
        <Download className="h-4 w-4" />
        Download .ics
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopySummary}>
        <Copy className="h-4 w-4" />
        Copy Summary
      </Button>
      <Button variant="outline" size="sm" onClick={handleShareLink}>
        <Share2 className="h-4 w-4" />
        Share Link
      </Button>
    </div>
  );
}
