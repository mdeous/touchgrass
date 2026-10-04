import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const meta = getCountryMeta(config.country);

  const handleDownloadIcs = () => {
    try {
      if (downloadIcs(result, config.year)) {
        toast.success(t("export.icsDownloaded"));
      } else {
        toast.info(t("export.icsEmpty"));
      }
    } catch {
      toast.error(t("export.icsFailed"));
    }
  };

  const handleCopySummary = async () => {
    try {
      const text = generateTextSummary(result, config.year, meta);
      await navigator.clipboard.writeText(text);
      toast.success(t("export.summaryCopied"));
    } catch {
      toast.error(t("export.summaryFailed"));
    }
  };

  const handleShareLink = async () => {
    try {
      const hash = encodeConfig(config, i18n.language);
      const url = `${window.location.origin}${window.location.pathname}#${hash}`;
      await navigator.clipboard.writeText(url);
      toast.success(t("export.linkCopied"));
    } catch {
      toast.error(t("export.linkFailed"));
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleDownloadIcs}
        title={t("export.downloadIcs")}
      >
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopySummary}
        title={t("export.copySummary")}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleShareLink}
        title={t("export.shareLink")}
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
