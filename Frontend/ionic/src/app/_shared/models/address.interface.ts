export interface IAddress {
  id?: string;
  phone?: string;
  isActive?: boolean;
  houseNo?: number;
  number: number;
  address1: string;
  address2: string;
  city: string;
  lga: string;
  state: { code: string };
  country: { code: string };
  lng: string;
  lat: string;
  geometry: {lat: number|undefined, lng: number|undefined}
}
