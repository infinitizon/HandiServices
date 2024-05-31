export const ValidationMessages = {
  amount: {
    required: 'Amount is required.',
    max: 'Maximum amount is 1,000,000,000',
    min: 'Amount cannot be less than {{minAmount}}'
  },
  gateway: {
    required: 'Gateway is required',
  },
  paymentMethod: {
    required: 'Payment Method is required',
  },
};
export let FormErrors = {
  // sharePrice: '',
  paymentMethod: '',
  amount: '',
  gateway: '',
};

export interface IFundTrading {
  // sharePrice: number,
  paymentMethod: string;
  amount: number;
  gateway: string;
}
