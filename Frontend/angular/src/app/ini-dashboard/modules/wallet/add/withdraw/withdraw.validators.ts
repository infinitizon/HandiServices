export const ValidationMessages = {
  banks: {
    required: 'Please select a bank',
  },
  amount: {
    required: 'Amount is required',
  },
};
export let FormErrors = {
  banks: '',
  amount: ''
};

export interface withdrawDetail {
  banks: string;
  amount: number;
}
