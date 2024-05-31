export const ValidationMessages = {
  firstName: {
    required: 'First Name is required',
  },
  lastName: {
    required: 'Last Name is required',
  },
  email: {
    required: 'Email is required',
    pattern: 'Enter valid email'
  },
  phone: {
    required: 'Phone number is required',
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
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export interface SignUp {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string
}
