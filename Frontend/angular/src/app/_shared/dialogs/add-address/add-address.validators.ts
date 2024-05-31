export const ValidationMessages = {
  name: {
    required: 'Business Name is required',
  },
  email: {
    required: 'Email is required',
    pattern: 'Enter valid email'
  },
  category: {
    required: 'Category is required',
  },
  address: {
    required: 'Business Address is required'
  },
  phone: {
    required: 'Phone number is required'
  }
};
export let FormErrors = {
  name: '',
  email: '',
  category: '',
  address: '',
  phone: ''
};

export interface SignUp {
  name: string;
  email: string;
  category: string;
  address: string;
  phone: string;
}
