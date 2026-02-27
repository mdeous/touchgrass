import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PtoBudgetInputs } from "@/components/config/PtoBudgetInputs";
import { RegionSelector } from "@/components/config/RegionSelector";
import { SchoolZoneSelector } from "@/components/config/SchoolZoneSelector";
import { StrategySelector } from "@/components/config/StrategySelector";
import { BlackoutDatePicker } from "@/components/config/BlackoutDatePicker";
import { PreBookedPicker } from "@/components/config/PreBookedPicker";
import { CustomHolidayPicker } from "@/components/config/CustomHolidayPicker";

export function ConfigPanel() {
  return (
    <Accordion
      type="multiple"
      defaultValue={["leave-budget", "region-zone", "strategy"]}
      className="w-full"
    >
      <AccordionItem value="leave-budget">
        <AccordionTrigger>Leave Budget</AccordionTrigger>
        <AccordionContent>
          <PtoBudgetInputs />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="region-zone">
        <AccordionTrigger>Region &amp; School Zone</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            <RegionSelector />
            <SchoolZoneSelector />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="strategy">
        <AccordionTrigger>Optimization Strategy</AccordionTrigger>
        <AccordionContent>
          <StrategySelector />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="blocked-dates">
        <AccordionTrigger>Blocked &amp; Pre-booked Dates</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            <BlackoutDatePicker />
            <PreBookedPicker />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="custom-holidays">
        <AccordionTrigger>Custom Holidays</AccordionTrigger>
        <AccordionContent>
          <CustomHolidayPicker />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
