export interface Assets {
  id: string;
  tenantId: null;
  name: string;
  description: string;
  currency: string;
  sharePrice: number;
  minPurchaseUnits: number;
  subsequentMultipleUnits: number;
  openingDate: Date;
  closingDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
  Media: Media[];
  subTitle: string;

}

export interface Media {
  id: string;
  name: string;
  link: string;
}
