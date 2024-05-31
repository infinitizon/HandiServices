export const ValidationMessages = {

  oldEmail: {
    required: 'Email is required',
    pattern: 'Enter valid email'
  },
  newEmail: {
    required: 'Email is required',
    pattern: 'Enter valid email'
  }
};
export let FormErrors = {
  oldEmail: '',
  newEmail: ''

};

export interface SignUp {
  oldEmail: string;
  newEmail: string;
}
