export const ValidationMessages = {
  token: {
    required: 'Token is required'
  },
  password: {
    required: 'Password is required',
    minlength: 'Must be minimum of 6 characters',
    oneDigit: 'Must contain one digit',
    oneLowerCase: 'Must contain one lowercase letter',
    oneUpperCase: 'Must contain one uppercase letter',
    specialChar: 'Must contain one special character e.g _, !, @, etc',
  },
  confirmPassword: {
    required: 'Confirm Password is required',
    mustMatch: 'Password  and Confirm password fields do not match',
  },
};
export let FormErrors = {
  password: '',
  confirmPassword: '',
  token: ''

};

export interface ResetPassword {
  password: string;
  confirmPassword: string;
  token: number;
}
