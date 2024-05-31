export const ValidationMessages = {

  username: {
    required: 'Username is required',
    pattern: 'Enter valid email'
  },
  password: {
    required: 'Password is required',
    pattern: 'Enter valid email'
  }
};
export let FormErrors = {
  username: '',
  password: ''

};

export interface SignUp {
  username: string;
  password: string;
}
