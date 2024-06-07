import { User } from "./User";

interface ILogin {
  status: number;
  success: boolean;
  token: string;
  multiTenant: boolean;
  xUUIDToken: string;
  user: User;
}
class Login implements ILogin {
  constructor(
    public status: number,
    public success: boolean,
    public token: string,
    public multiTenant: boolean,
    public xUUIDToken: string,
    public user: User,
  ) {}
}

export { Login, ILogin }
