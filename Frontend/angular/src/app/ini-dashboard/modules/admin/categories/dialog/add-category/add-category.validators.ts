export const ValidationMessages = {
  title: {
    required: 'Title is required',
  },
  summary: {
    required: 'Summary is required',
  },
  sku: {
    required: 'Sku is required',
  }
};
export let FormErrors = {
  title: '',
  summary: '',
  sku: ''
};

export interface Category {
  title: string;
  summary: string;
  sku: string;
}
