export interface RegionInfo {
  readonly id: string;
  readonly label: string;
}

export const REGIONS: readonly RegionInfo[] = [
  { id: "metropolitan", label: "France métropolitaine" },
  { id: "alsace-moselle", label: "Alsace-Moselle" },
  { id: "guadeloupe", label: "Guadeloupe" },
  { id: "martinique", label: "Martinique" },
  { id: "guyane", label: "Guyane" },
  { id: "reunion", label: "La Réunion" },
  { id: "mayotte", label: "Mayotte" },
];
