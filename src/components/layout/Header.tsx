import { useTranslation } from "react-i18next";
import { Leaf, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { useTheme } from "@/hooks/use-theme";
import { LanguagePicker } from "@/components/layout/LanguagePicker";

const currentYear = new Date().getFullYear();
// Past years are not offered: every day in them is already over.
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear + i);

export function Header() {
  const { t } = useTranslation();
  const year = useAppStore((s) => s.year);
  // A shared link may point at another year; keep it selectable.
  const years = YEARS.includes(year) ? YEARS : [...YEARS, year].sort();
  const setYear = useAppStore((s) => s.setYear);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Leaf className="size-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">TouchGrass</span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-24" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <LanguagePicker />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={t("header.toggleTheme")}
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
