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
    required: 'Phone is required',
  },
  password: {
    required: 'Password is required',
    minlength: 'Must be minimum of 6 characters',
    oneDigit: 'Must contain one digit',
    oneLowerCase: 'Must contain one lowercase letter',
    oneUpperCase: 'Must contain one uppercase letter',
    specialChar: 'Must contain one special character e.g _, !, @, etc',
  },
  cPassword: {
    required: 'Confirm Password is required',
    mustMatch: 'Password and Confirm password fields do not match',
  },

  name: {
    required: 'Business Name is required',
  },
  category: {
    required: 'Category is required',
  },
  address: {
    required: 'Business Address is required'
  }
};
export let FormErrors = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  cPassword: '',

  name: '',
  category: '',
  address: ''
};
