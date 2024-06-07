import { Optional } from '@angular/core';

interface IRole {
  id: string;
  name: string;
}
class Role implements IRole {
  constructor(
    public id: string,
    @Optional() public name: string,
  ) {}
}

export { Role, IRole }
