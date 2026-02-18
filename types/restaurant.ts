export interface Restaurant {
  id: number;
  nom: string;
  adresse: string;
  type: string;
  note: number | null;
  horaires: string | null;
  site: string | null;
  instagram: string | null;
  photo: string | null;
  quartier: string;
  lat: number;
  lon: number;
}

export interface RestaurantData {
  restaurants: Restaurant[];
}
