/** Date-picker props that keep navigation inside the selected year. */
export function yearPickerProps(year: number) {
  const now = new Date();
  return {
    startMonth: new Date(year, 0, 1),
    endMonth: new Date(year, 11, 1),
    defaultMonth: now.getFullYear() === year ? now : new Date(year, 0, 1),
  };
}

/** True if a `yyyy-MM-dd` key falls in `year`. */
export function isInYear(dateKey: string, year: number): boolean {
  return dateKey.startsWith(`${year}-`);
}
