# 🌿 TouchGrass

**Maximize your time off. Touch grass more often.**

🗓️ Time-off optimizer · 🌍 30 countries · 🔗 Shareable links · 📱 PWA · 🇬🇧🇫🇷 EN/FR

[**Try it live →**](https://mdeous.github.io/touchgrass/)

---

## ✨ Features
>
- 🧠 **Smart optimization** — Finds bridge days between holidays and weekends, then allocates your leave budget for maximum consecutive days off
- 🌍 **30 countries** — Public holidays, regional subdivisions, and country-specific leave types out of the box
- 📊 **3 strategies** — Balanced, Long Weekends, or Extended Vacations depending on your style
- 🚫 **Blackout dates** — Mark days you can't take off; the optimizer works around them
- 📌 **Pre-booked leave** — Already have days planned? Include them so the optimizer accounts for your existing schedule
- 🏖️ **Custom holidays** — Add company days off or personal holidays
- 📅 **ICS export** — Download optimized leave as a calendar file
- 🔗 **Shareable URL** — Share your full configuration via a single link
- 📋 **Text summary** — Copy a plain-text summary of your results
- 🌙 **Dark mode** — Automatic or manual theme switching
- 📱 **Installable PWA** — Works offline as a native-feeling app

## 🌍 Supported Countries

🇦🇪 UAE · 🇦🇹 Austria · 🇦🇺 Australia · 🇧🇪 Belgium · 🇧🇷 Brazil · 🇨🇦 Canada · 🇨🇭 Switzerland · 🇨🇿 Czech Republic · 🇩🇪 Germany · 🇩🇰 Denmark · 🇪🇸 Spain · 🇫🇮 Finland · 🇫🇷 France · 🇬🇧 United Kingdom · 🇬🇷 Greece · 🇮🇪 Ireland · 🇮🇳 India · 🇮🇹 Italy · 🇯🇵 Japan · 🇱🇺 Luxembourg · 🇲🇽 Mexico · 🇳🇱 Netherlands · 🇳🇴 Norway · 🇳🇿 New Zealand · 🇵🇱 Poland · 🇵🇹 Portugal · 🇸🇦 Saudi Arabia · 🇸🇪 Sweden · 🇸🇬 Singapore · 🇺🇸 United States

## 🧩 How It Works

1. **Build a calendar** — Each day of the year is tagged as a workday, weekend, or holiday based on your country and region
2. **Find bridges** — The engine scans for workday gaps (1–4 days) between off-days that can be "bridged" with leave
3. **Score & rank** — Bridges are scored by efficiency (days off gained per leave day spent), weighted by your chosen strategy
4. **Optimize** — A greedy algorithm selects the best bridges within your leave budget, respecting blackouts and pre-booked days
5. **Allocate** — Each selected bridge day is assigned as PTO or Recovery, preferring recovery days for single-day bridges

**Efficiency example:** Taking 1 PTO day on a Friday between a Thursday holiday and the weekend gives you 4 consecutive days off — that's 4× efficiency.

## 🛠️ Tech Stack

| Layer     | Technologies                           |
| --------- | -------------------------------------- |
| Framework | React 19, TypeScript, Vite 7           |
| Styling   | Tailwind CSS 4, Radix UI, Lucide icons |
| State     | Zustand 5, URL hash sync               |
| i18n      | i18next (English, French)              |
| Testing   | Vitest, Testing Library, jsdom         |
| Export    | ICS generation, base64url sharing      |

## 🚀 Getting Started

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
| `npm run test`     | Run tests in watch mode       |
| `npm run test:run` | Single test run               |

## 🏗️ Architecture

The core is a **pure-function pipeline** with no side effects:

```text
buildCalendar → findBridges → scoreBridges → optimize → allocate
```

```text
src/
├── engine/          # Pure optimization pipeline
│   ├── calendar-utils.ts   # Day tagging (workday/weekend/holiday)
│   ├── bridge-finder.ts    # Gap detection between off-days
│   ├── scorer.ts           # Strategy-weighted scoring
│   ├── optimizer.ts        # Greedy bridge selection
│   ├── allocator.ts        # PTO vs Recovery assignment
│   └── types.ts            # Shared types
├── data/            # Holidays, regions, country metadata
├── store/           # Zustand state management
├── hooks/           # React hooks (optimization, URL sync)
├── components/      # UI (config, calendar, results)
├── i18n/            # Translations (EN, FR)
└── export/          # ICS, text summary, URL encoding
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT
