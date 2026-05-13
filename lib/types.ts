export interface BottlePosition {
  rack: string;
  row: number;
  col: number;
}

export interface Bottle {
  id: string;
  name: string;
  year: number;
  region: string;
  varietal: string;
  producer: string;
  position: BottlePosition | null;
  notes: string;
  drinkBy: string;
}
