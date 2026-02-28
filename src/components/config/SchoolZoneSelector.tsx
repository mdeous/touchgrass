import { useTranslation } from "react-i18next";
import type { SchoolZone } from "@/engine/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { getCountryMeta } from "@/data/country-meta";

export function SchoolZoneSelector() {
  const { t } = useTranslation();
  const country = useAppStore((s) => s.country);
  const schoolZone = useAppStore((s) => s.schoolZone);
  const setSchoolZone = useAppStore((s) => s.setSchoolZone);

  const meta = getCountryMeta(country);
  if (!meta.hasSchoolZones) return null;

  const zones: { value: SchoolZone; label: string }[] = [
    { value: "none", label: t("zone.none") },
    { value: "A", label: t("zone.A") },
    { value: "B", label: t("zone.B") },
    { value: "C", label: t("zone.C") },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="zone-select">{t("config.schoolZone")}</Label>
      <Select value={schoolZone} onValueChange={setSchoolZone}>
        <SelectTrigger id="zone-select" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {zones.map((z) => (
            <SelectItem key={z.value} value={z.value}>
              {z.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {t("config.schoolZoneHelper")}
      </p>
    </div>
  );
}
