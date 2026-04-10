# :herb: TouchGrass

**Maximize your time off. Touch grass more often.**

:calendar: Time-off optimizer · :earth_africa: 30 countries · :link: Shareable links · :iphone: PWA · :gb: EN / :fr: FR

---

## :sparkles: Features
>
- :brain: **Smart optimization** — Finds bridge days between holidays and weekends, then allocates your leave budget for maximum consecutive days off
- :earth_africa: **30 countries** — Public holidays, regional subdivisions, and country-specific leave types out of the box
- :bar_chart: **3 strategies** — Balanced, Long Weekends, or Extended Vacations depending on your style
- :no_entry: **Blackout dates** — Mark days you can't take off; the optimizer works around them
- :pushpin: **Pre-booked leave** — Already have days planned? Include them so the optimizer accounts for your existing schedule
- :beach_umbrella: **Custom holidays** — Add company days off or personal holidays
- :calendar: **ICS export** — Download optimized leave as a calendar file
- :link: **Shareable URL** — Share your full configuration via a single link
- :clipboard: **Text summary** — Copy a plain-text summary of your results
- :crescent_moon: **Dark mode** — Automatic or manual theme switching
- :iphone: **Installable PWA** — Works offline as a native-feeling app

## :earth_africa: Supported Countries

:united_arab_emirates: UAE · :austria: Austria · :australia: Australia · :belgium: Belgium · :brazil: Brazil · :canada: Canada · :switzerland: Switzerland · :czech_republic: Czech Republic · :de: Germany · :denmark: Denmark · :es: Spain · :finland: Finland · :fr: France · :gb: United Kingdom · :greece: Greece · :ireland: Ireland · :india: India · :it: Italy · :jp: Japan · :luxembourg: Luxembourg · :mexico: Mexico · :netherlands: Netherlands · :norway: Norway · :new_zealand: New Zealand · :poland: Poland · :portugal: Portugal · :saudi_arabia: Saudi Arabia · :sweden: Sweden · :singapore: Singapore · :us: United States

## :jigsaw: How It Works

1. **Build a calendar** — Each day of the year is tagged as a workday, weekend, or holiday based on your country and region
2. **Find bridges** — The engine scans for workday gaps (1–4 days) between off-days that can be "bridged" with leave
3. **Score & rank** — Bridges are scored by efficiency (days off gained per leave day spent), weighted by your chosen strategy
4. **Optimize** — A greedy algorithm selects the best bridges within your leave budget, respecting blackouts and pre-booked days
5. **Allocate** — Each selected bridge day is assigned as PTO or Recovery, preferring recovery days for single-day bridges

**Efficiency example:** Taking 1 PTO day on a Friday between a Thursday holiday and the weekend gives you 4 consecutive days off — that's 4× efficiency.

## :rocket: Getting Started

```bash
git clone https://github.com/mdeous/touchgrass.git
cd touchgrass
npm install
npm run dev
```

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `npm run dev`      | Start dev server              |
| `npm run build`    | Type-check + production build |
| `npm run lint`     | Run ESLint                    |
| `npm run test`     | Run tests                     |

## :handshake: Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## :page_facing_up: License

MIT
