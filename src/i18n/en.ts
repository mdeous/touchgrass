const en = {
  // Header
  "header.toggleTheme": "Toggle theme",

  // AppShell
  "app.configuration": "Configuration",
  "app.loadingHolidays": "Loading holidays...",

  // Config panel sections
  "config.location": "Location",
  "config.leaveBudget": "Leave budget",
  "config.optimizationStrategy": "Optimization strategy",
  "config.blockedDates": "Blocked & pre-booked dates",
  "config.customHolidays": "Custom holidays",

  // Country
  "config.country": "Country",
  "config.selectCountry": "Select country",

  // Subdivision
  "config.loading": "Loading...",
  "config.selectSubdivision": "Select {{label}}",

  // PTO Budget
  "config.paidTimeOff": "Paid time off",
  "config.recoveryDays": "Recovery days",
  "config.ptoHelper": "Paid vacation days available (default {{count}})",
  "config.recoveryHelper": "Recovery days available (default {{count}})",

  // Strategy
  "strategy.balanced": "Balanced",
  "strategy.balancedDesc": "Mix of long weekends and extended breaks",
  "strategy.longWeekends": "Long weekends",
  "strategy.longWeekendsDesc": "Maximize 3-4 day weekends throughout the year",
  "strategy.extended": "Extended vacations",
  "strategy.extendedDesc": "Fewer but longer vacation periods",

  // Weekend
  "config.weekendDays": "Weekend days",
  "config.weekendHelper": "Days off each week",
  "day.mon": "M",
  "day.tue": "T",
  "day.wed": "W",
  "day.thu": "T",
  "day.fri": "F",
  "day.sat": "S",
  "day.sun": "S",

  // School zone
  "config.schoolZone": "School zone",
  "config.schoolZoneHelper":
    "Highlights school vacation periods to help plan family-friendly breaks.",
  "zone.none": "None",
  "zone.A": "Zone A",
  "zone.B": "Zone B",
  "zone.C": "Zone C",

  // Blackout dates
  "config.blackoutDates": "Blackout dates",
  "config.add": "Add",
  "config.blackoutHelper": "Days when you cannot take time off.",
  "config.removeDate": "Remove {{date}}",

  // Pre-booked
  "config.preBookedDays": "Pre-booked days",
  "config.type": "Type:",
  "config.pto": "PTO",
  "config.rtt": "RTT",
  "config.preBookedHelper":
    "Days already booked off — not counted against your leave budget. The optimizer will work around them.",

  // Custom holidays
  "config.customHolidaysHelper":
    "Company-specific holidays (e.g., founding day, bridge days).",

  // Calendar legend
  "legend.workday": "Workday",
  "legend.weekend": "Weekend",
  "legend.holiday": "Holiday",
  "legend.pto": "PTO",
  "legend.recovery": "Recovery (RTT)",
  "legend.blackout": "Blackout",
  "legend.prebooked": "Pre-booked",
  "legend.schoolHoliday": "School hol.",

  // Calendar day headers
  "calendar.mon": "Mon",
  "calendar.tue": "Tue",
  "calendar.wed": "Wed",
  "calendar.thu": "Thu",
  "calendar.fri": "Fri",
  "calendar.sat": "Sat",
  "calendar.sun": "Sun",

  // Day cell tooltip
  "dayCell.type": "Type: {{type}}",
  "dayCell.schoolHoliday": "School holiday ({{zone}})",

  // Results
  "results.title": "Results",
  "results.noResults": "No optimization results yet.",
  "results.getStarted": "Configure your PTO budget to get started.",
  "results.bridgesSelected": "Bridges ({{count}} selected)",
  "results.totalDaysOff": "Total days off",
  "results.avgEfficiency": "Avg efficiency",
  "results.used": "{{label}} used",
  "results.remaining": "{{count}} remaining",

  // Cluster card
  "bridge.break": "Break",
  "bridge.daysOff": "{{count}}d off",
  "bridge.ptoCost_one": "cost: {{count}} day",
  "bridge.ptoCost_other": "cost: {{count}} days",

  // Time off summary
  "timeOff.title": "Time off summary",
  "timeOff.daysToRequest_one": "{{label}} days to request ({{count}} day)",
  "timeOff.daysToRequest_other": "{{label}} days to request ({{count}} days)",
  "timeOff.copy": "Copy",
  "timeOff.copied": "Time off summary copied to clipboard",
  "timeOff.copyFailed": "Failed to copy summary",

  // Export
  "export.downloadIcs": "Download .ics",
  "export.copySummary": "Copy summary",
  "export.shareLink": "Share link",
  "export.icsDownloaded": "Calendar file downloaded",
  "export.icsFailed": "Failed to generate calendar file",
  "export.summaryCopied": "Summary copied to clipboard",
  "export.summaryFailed": "Failed to copy summary",
  "export.linkCopied": "Share link copied to clipboard",
  "export.linkFailed": "Failed to generate share link",

  // ICS / text summary
  "export.pontTitle": "Pont: {{name}}",
  "export.ptoTitle": "PTO",
  "export.bridgeDesc_one": "{{total}} days off ({{count}} PTO day)",
  "export.bridgeDesc_other": "{{total}} days off ({{count}} PTO days)",
  "export.calendarName": "TouchGrass {{year}}",
  "export.planHeader": "TouchGrass PTO plan {{year}}",
  "export.totalDaysOff": "Total days off: {{count}}",
  "export.labelUsed": "{{label}} used: {{count}}",
  "export.avgEfficiency": "Average efficiency: {{value}}:1",
  "export.numBreaks": "Number of breaks: {{count}}",
  "export.ptoBreak": "PTO break",
  "export.daysOff_one": "{{count}} day off",
  "export.daysOff_other": "{{count}} days off",
  "export.ptoDays_one": "{{count}} PTO day",
  "export.ptoDays_other": "{{count}} PTO days",
  "export.efficiency": "{{value}}:1 efficiency",

  // PWA
  "pwa.offlineReady": "App ready to work offline",
  "pwa.newVersion": "New version available",
  "pwa.reload": "Reload",
} as const;

export default en;
