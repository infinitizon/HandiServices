export interface User {
  id: string;
  bvn: string;
  firstName: string;
  lastName: string;
  email: string;
  isEnabled: boolean;
  isLocked: boolean;
  Tenant: Tenant[];
  dob: string;
  phone: string;
  address1: string;
  nextOfKinAddress: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;
  nextOfKinName: string;
  NextOfKins: NextOfKins[];
  Addresses: Addresses[];
}

export interface Tenant {
  id: string;
  name: string;
  Roles: Role[];
}

export interface NextOfKins {
  address: string;
  email: string;
  id: string;
  isEnabled: boolean;
  isLocked: boolean;
  isPrimary: boolean;
  name: string;
  phone: string;
  relationship: string;
}

export interface Addresses {
  address1: string;
  address2: string;
  address3: string;
  city: string;
  country: string;
  id: string;
  no: string;
  state: string;
}

export interface Role {
  name: string;
}

export const UserDO: User = {
  id: '',
  bvn: '',
  firstName: '',
  lastName: '',
  email: '',
  isEnabled: false,
  isLocked: false,
  Tenant: [],
  dob: '',
  phone: '',
  address1: '',
  nextOfKinAddress: '',
  nextOfKinPhone: '',
  nextOfKinEmail: '',
  nextOfKinName: '',
  NextOfKins: [],
  Addresses: []
};
