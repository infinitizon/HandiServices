export const ValidationMessages = {
  address: {
    required: 'Address is required'
  },
  phone: {
    required: 'Phone number is required'
  }
};
export let FormErrors = {
  address: '',
  phone: ''
};

export interface SignUp {
  address: string;
  phone: string;
}
