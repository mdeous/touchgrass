const fr = {
  // Header
  "header.toggleTheme": "Changer le thème",

  // AppShell
  "app.configuration": "Configuration",
  "app.loadingHolidays": "Chargement des jours fériés...",
  "app.noHolidayData": "Aucune donnée de jours fériés disponible pour {{year}} dans ce pays.",

  // Config panel sections
  "config.location": "Localisation",
  "config.leaveBudget": "Budget congés",
  "config.optimizationStrategy": "Stratégie d'optimisation",
  "config.blockedDates": "Dates bloquées et pré-réservées",
  "config.customHolidays": "Jours fériés personnalisés",

  // Country
  "config.country": "Pays",
  "config.selectCountry": "Sélectionner un pays",

  // Subdivision
  "config.loading": "Chargement...",
  "config.selectSubdivision": "Sélectionner {{label}}",

  // PTO Budget
  "config.paidTimeOff": "Congés payés",
  "config.recoveryDays": "Jours de RTT",
  "config.ptoHelper": "Jours de congés disponibles (défaut {{count}})",
  "config.recoveryHelper": "Jours de RTT disponibles (défaut {{count}})",

  // Strategy
  "strategy.balanced": "Équilibré",
  "strategy.balancedDesc": "Mix de week-ends prolongés et de vacances longues",
  "strategy.longWeekends": "Week-ends prolongés",
  "strategy.longWeekendsDesc":
    "Maximiser les week-ends de 3-4 jours tout au long de l'année",
  "strategy.extended": "Vacances longues",
  "strategy.extendedDesc": "Moins de pauses mais plus longues",

  // Weekend
  "config.weekendDays": "Jours de week-end",
  "config.weekendHelper": "Jours de repos par semaine",
  "day.mon": "L",
  "day.tue": "M",
  "day.wed": "M",
  "day.thu": "J",
  "day.fri": "V",
  "day.sat": "S",
  "day.sun": "D",

  // School zone
  "config.schoolZone": "Zone scolaire",
  "config.schoolZoneHelper":
    "Met en évidence les vacances scolaires pour planifier des pauses en famille.",
  "zone.none": "Aucune",
  "zone.A": "Zone A",
  "zone.B": "Zone B",
  "zone.C": "Zone C",

  // Blackout dates
  "config.blackoutDates": "Dates bloquées",
  "config.add": "Ajouter",
  "config.blackoutHelper": "Jours où vous ne pouvez pas prendre de congé.",
  "config.removeDate": "Supprimer {{date}}",

  // Pre-booked
  "config.preBookedDays": "Jours pré-réservés",
  "config.type": "Type :",
  "config.pto": "CP",
  "config.rtt": "RTT",
  "config.preBookedHelper":
    "Jours déjà posés — l'optimiseur les prendra en compte.",

  // Custom holidays
  "config.customHolidaysHelper":
    "Jours fériés spécifiques à l'entreprise (ex: journée de fondation, ponts).",

  // Calendar legend
  "legend.workday": "Travail",
  "legend.weekend": "Week-end",
  "legend.holiday": "Férié",
  "legend.pto": "CP",
  "legend.recovery": "RTT",
  "legend.blackout": "Bloqué",
  "legend.prebooked": "Pré-réservé",
  "legend.schoolHoliday": "Vac. scol.",

  // Calendar day headers
  "calendar.mon": "Lun",
  "calendar.tue": "Mar",
  "calendar.wed": "Mer",
  "calendar.thu": "Jeu",
  "calendar.fri": "Ven",
  "calendar.sat": "Sam",
  "calendar.sun": "Dim",

  // Day cell tooltip
  "dayCell.type": "Type : {{type}}",
  "dayCell.schoolHoliday": "Vacances scolaires ({{zone}})",

  // Results
  "results.title": "Résultats",
  "results.noResults": "Aucun résultat d'optimisation.",
  "results.getStarted": "Configurez votre budget de congés pour commencer.",
  "results.bridgesSelected": "Ponts ({{count}} sélectionnés)",
  "results.totalDaysOff": "Total jours de repos",
  "results.avgEfficiency": "Efficacité moy.",
  "results.used": "{{label}} utilisés",
  "results.remaining": "{{count}} restants",

  // Cluster card
  "bridge.break": "Pause",
  "bridge.daysOff": "{{count}}j de repos",
  "bridge.ptoCost_one": "coût : {{count}} jour",
  "bridge.ptoCost_other": "coût : {{count}} jours",

  // Time off summary
  "timeOff.title": "Récapitulatif des congés",
  "timeOff.daysToRequest_one": "{{label}} à poser ({{count}} jour)",
  "timeOff.daysToRequest_other": "{{label}} à poser ({{count}} jours)",
  "timeOff.copy": "Copier",
  "timeOff.copied": "Récapitulatif copié dans le presse-papiers",
  "timeOff.copyFailed": "Impossible de copier le récapitulatif",

  // Export
  "export.downloadIcs": "Télécharger .ics",
  "export.copySummary": "Copier le résumé",
  "export.shareLink": "Partager le lien",
  "export.icsDownloaded": "Fichier calendrier téléchargé",
  "export.icsFailed": "Impossible de générer le fichier calendrier",
  "export.icsEmpty": "Aucune pause à exporter pour l'instant",
  "export.summaryCopied": "Résumé copié dans le presse-papiers",
  "export.summaryFailed": "Impossible de copier le résumé",
  "export.linkCopied": "Lien de partage copié dans le presse-papiers",
  "export.linkFailed": "Impossible de générer le lien de partage",

  // ICS / text summary
  "export.pontTitle": "Pont : {{name}}",
  "export.ptoTitle": "Congé",
  "export.bridgeDesc_one": "{{total}} jours de repos ({{count}} jour de congé)",
  "export.bridgeDesc_other":
    "{{total}} jours de repos ({{count}} jours de congé)",
  "export.calendarName": "TouchGrass {{year}}",
  "export.planHeader": "TouchGrass Plan Congés {{year}}",
  "export.totalDaysOff": "Total jours de repos : {{count}}",
  "export.labelUsed": "{{label}} utilisés : {{count}}",
  "export.avgEfficiency": "Efficacité moyenne : {{value}}:1",
  "export.numBreaks": "Nombre de pauses : {{count}}",
  "export.ptoBreak": "Pause congé",
  "export.daysOff_one": "{{count}} jour de repos",
  "export.daysOff_other": "{{count}} jours de repos",
  "export.ptoDays_one": "{{count}} jour de congé",
  "export.ptoDays_other": "{{count}} jours de congé",
  "export.efficiency": "{{value}}:1 efficacité",

  // PWA
  "pwa.offlineReady": "Application prête pour le mode hors-ligne",
  "pwa.newVersion": "Nouvelle version disponible",
  "pwa.reload": "Recharger",
} as const;

export default fr;
