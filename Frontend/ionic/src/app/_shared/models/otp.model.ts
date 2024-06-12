export interface IOTP {
  title?: string;
  subTitle?: string;
  timer?: string;
  email: string;
  endpoint?: string;
  formData?: any;
}
export interface IOTPVerified {
  verified: boolean;
  data?: any;
  error?: string;
}
