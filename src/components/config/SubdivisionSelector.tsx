import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { loadSubdivisions } from "@/data/holiday-loader";

export function SubdivisionSelector() {
  const { t } = useTranslation();
  const country = useAppStore((s) => s.country);
  const subdivision = useAppStore((s) => s.subdivision);
  const setSubdivision = useAppStore((s) => s.setSubdivision);

  const [state, setState] = useState<{
    subs: Record<string, string>;
    loading: boolean;
    key: string;
  }>({
    subs: {},
    loading: true,
    key: country,
  });

  const meta = getCountryMeta(country);
  const loading = state.loading || state.key !== country;

  useEffect(() => {
    let cancelled = false;

    loadSubdivisions(country).then((result) => {
      if (!cancelled) {
        setState({ subs: result, loading: false, key: country });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [country]);

  const entries = Object.entries(state.subs);

  if (!loading && entries.length === 1 && entries[0][0] === "default") {
    return null;
  }

  const selectId = "subdivision-select";

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={selectId}>{meta.subdivisionLabel}</Label>
        <Select disabled>
          <SelectTrigger id={selectId} className="w-full">
            <SelectValue placeholder={t("config.loading")} />
          </SelectTrigger>
          <SelectContent />
        </Select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={selectId}>{meta.subdivisionLabel}</Label>
      <Select value={subdivision} onValueChange={setSubdivision}>
        <SelectTrigger id={selectId} className="w-full">
          <SelectValue
            placeholder={t("config.selectSubdivision", {
              label: meta.subdivisionLabel.toLowerCase(),
            })}
          />
        </SelectTrigger>
        <SelectContent>
          {entries.map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
