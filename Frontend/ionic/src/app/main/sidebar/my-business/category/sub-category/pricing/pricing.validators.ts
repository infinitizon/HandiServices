export const ValidationMessages  = {
  'characteristic': {
    'required': 'Type is required',
  },
  'price' : {
    'required': 'Price is required'
  },
};
export let FormErrors = {
  characteristic: '',
  price: '',
};

export interface Detail {
  characteristic: any,
  price: string,
}
