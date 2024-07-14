export const ValidationMessages = {
  firstName: {
    required: 'First Name is required'
  },
  lastName: {
    required: 'Last Name is required'
  },
  address: {
    required: 'Address is required'
  },
  phone: {
    required: 'Phone number is required'
  }
};
export let FormErrors = {
  firstName: '',
  lastName: '',
  address: '',
  phone: ''
};

export interface SignUp {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
}
