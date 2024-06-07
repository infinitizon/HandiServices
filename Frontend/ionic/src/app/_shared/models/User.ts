import { Optional } from '@angular/core';
import { Tenant } from './Tenant';

interface IUser {
  id: string
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  bvn: string;
  firstLogin: boolean;
  isEnabled: boolean;
  isLocked: boolean;
  refCode: string;
  referral?: string;
  updatedAt: Date;
  Tenant: Tenant[]
}
class User implements IUser {
  constructor(
    public id: string,
    public firstName: string,
    public middleName: string,
    public lastName: string,
    public email: string,
    public bvn: string,
    public firstLogin: boolean,
    public isEnabled: boolean,
    public isLocked: boolean,
    public refCode: string,
    public updatedAt: Date,
    @Optional() public Tenant: Tenant[]
  ){}
}

export { User, IUser }
