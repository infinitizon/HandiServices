export const ValidationMessages = {
  amount: {
    required: 'Amount is required',
  },
  gateway: {
    required: 'gateway is required',
  }
};
export let FormErrors = {
  amount: '',
  gateway: ''
};

export interface Gateway {
  amount: string;
  gateway: string;
}
