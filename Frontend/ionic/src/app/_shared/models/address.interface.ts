export interface IAddress {
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
