export interface IOTP {
  title?: string;
  subTitle?: string;
  timer?: string;
  email: string;
  endpoint?: string;
}
export interface IOTPVerified {
  verified: boolean;
  error?: string;
}
