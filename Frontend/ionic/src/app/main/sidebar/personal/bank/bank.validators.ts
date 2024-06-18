export const ValidationMessages = {
  bankCode: {
    required: 'Please select a bank',
  },
  nuban: {
    required: 'NUBAN is required',
    minlength: 'NUBAN must be at least 10 characters',
    maxlength: 'NUBAN cannot be more than 10 characters',
    pattern: 'Must be valid NUBAN digits',
  },
};
export let FormErrors = {
  bankCode: '',
  nuban: '',
  bankName: '',
  bankAccountName: '',
};

export interface bankDetail {
  bankCode: string;
  nuban: string;
  bankName: string;
  bankAccountName: string;
}
