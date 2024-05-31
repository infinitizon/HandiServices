export const ValidationMessages = {
  category: {
    required: 'Category is required',
  },
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
  category: '',
  name: '',
  type: '',
  minPrice: '',
  maxPrice: '',
};

export interface Gateway {
  category: string;
  name: string;
  type: string;
  minPrice: string;
  maxPrice: string;
}
