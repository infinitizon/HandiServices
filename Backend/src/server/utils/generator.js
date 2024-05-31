module.exports = class Generator {
  static generatePassword() {
    const numDigits = 2;
    const numChars = 2;
    const numLetters = 4;

    const digits = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let password = '';

    for (let i = 0; i < numDigits; i++) {
      const randomDigit = digits.charAt(Math.floor(Math.random() * digits.length));
      password += randomDigit;
    }
    for (let i = 0; i < numChars; i++) {
      const randomChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
      password += randomChar;
    }
    for (let i = 0; i < numLetters; i++) {
      const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
      password += randomLetter;
    }
    password = password.split('');
    for (let i = password.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('').slice(0, 8); // Ensure the password is exactly 8 characters long
  }
}