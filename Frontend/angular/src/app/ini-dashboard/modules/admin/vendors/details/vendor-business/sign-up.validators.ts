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
  city: {
    required: 'City is required',
  },
  country: {
    required: 'Country is required',
  },
  address1: {
    required: 'Address is required'
  }
};
export let FormErrors = {
  name: '',
  email: '',
  category: '',
  city: '',
  country: '',
  address1: ''
};

export interface SignUp {
  name: string;
  email: string;
  category: string;
  city: string;
  country: string;
  address1: string
}
