export const ValidationMessages = {
  network: {
    required: 'Please select a network',
  },
  amount: {
    required: 'Amount is required',
  },
  phone: {
    required: 'Phone number is required',
    maxLength: 'Exceed Maximum number'
  }
};
export let FormErrors = {
  network: '',
  amount: '',
  phone: ''
};

export interface airtimeDetail {
  network: string;
  amount: number;
  phone: number;
}
