import { Optional } from '@angular/core';
import { Role } from './Role';

interface ITenant {
  id: string;
  name: string;
  Roles: Role[];
}
class Tenant implements ITenant {
  constructor(
    public id: string,
    public name: string,
    @Optional() public Roles: Role[]
  ) {}
}

export { Tenant, ITenant }
