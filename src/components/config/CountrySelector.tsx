import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, getCountryMeta } from "@/data/country-meta";
import { useAppStore } from "@/store/app-store";

export function CountrySelector() {
  const { t } = useTranslation();
  const country = useAppStore((s) => s.country);
  const setCountry = useAppStore((s) => s.setCountry);
  const selected = getCountryMeta(country);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="country-select">{t("config.country")}</Label>
      <Select value={country} onValueChange={setCountry}>
        <SelectTrigger id="country-select" className="w-full">
          <SelectValue placeholder={t("config.selectCountry")}>
            {selected.flag} {selected.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.flag} {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
