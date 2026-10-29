import { Calendar, Compass, Film, Headphones, Map, Utensils } from 'lucide-react';

/** Objective icons keyed by the ids the backend sends from /api/options. */
export const OBJECTIVE_ICONS = {
  calendar: Calendar,
  film: Film,
  headphones: Headphones,
  utensils: Utensils,
  compass: Compass,
  map: Map,
};

export const iconForObjective = (icon) => OBJECTIVE_ICONS[icon] || Compass;
