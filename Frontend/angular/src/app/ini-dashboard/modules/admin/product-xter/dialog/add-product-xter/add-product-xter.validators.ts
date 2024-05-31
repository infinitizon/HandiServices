export const ValidationMessages = {
  name: {
    required: 'Character name is required',
  },
  type: {
    required: 'Character type is required',
  },
  minPrice: {
    required: 'Minimum price is required',
  },
  maxPrice: {
    required: 'Character type is required',
  },
};
export let FormErrors = {
  name: '',
  type: '',
  minPrice: '',
  maxPrice: '',
};

export interface Gateway {
  name: string;
  type: string;
  minPrice: string;
  maxPrice: string;
}
