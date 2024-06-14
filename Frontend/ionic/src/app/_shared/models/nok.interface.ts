export interface INOK {
  id?: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isPrimary: boolean;
  isEnabled: boolean;
  relationship: {
    code: number;
    label: string;
  }
}
