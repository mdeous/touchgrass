import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CountrySelector } from "@/components/config/CountrySelector";
import { PtoBudgetInputs } from "@/components/config/PtoBudgetInputs";
import { SubdivisionSelector } from "@/components/config/SubdivisionSelector";
import { SchoolZoneSelector } from "@/components/config/SchoolZoneSelector";
import { WeekendSelector } from "@/components/config/WeekendSelector";
import { StrategySelector } from "@/components/config/StrategySelector";
import { BlackoutDatePicker } from "@/components/config/BlackoutDatePicker";
import { PreBookedPicker } from "@/components/config/PreBookedPicker";
import { CustomHolidayPicker } from "@/components/config/CustomHolidayPicker";

export function ConfigPanel() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <Accordion
        type="multiple"
        defaultValue={["location", "leave-budget", "strategy"]}
        className="w-full"
      >
        <AccordionItem value="location">
          <AccordionTrigger>{t("config.location")}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <CountrySelector />
              <SubdivisionSelector />
              <SchoolZoneSelector />
              <WeekendSelector />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="leave-budget">
          <AccordionTrigger>{t("config.leaveBudget")}</AccordionTrigger>
          <AccordionContent>
            <PtoBudgetInputs />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="strategy">
          <AccordionTrigger>
            {t("config.optimizationStrategy")}
          </AccordionTrigger>
          <AccordionContent>
            <StrategySelector />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="blocked-dates">
          <AccordionTrigger>{t("config.blockedDates")}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <BlackoutDatePicker />
              <PreBookedPicker />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="custom-holidays">
          <AccordionTrigger>{t("config.customHolidays")}</AccordionTrigger>
          <AccordionContent>
            <CustomHolidayPicker />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
