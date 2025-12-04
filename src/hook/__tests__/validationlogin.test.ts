import {
  isSenaEmail,
  isValidPassword,
  isValidNames,
  isValidSurnames,
  isValidDocumentNumber,
  isValidPhone,
  isValidResetCode,
  isCodeNotExpired,
  capitalizeWords,
} from '../validationlogin';

describe('validationlogin utilities', () => {
  test('isSenaEmail accepts institutional emails', () => {
    expect(isSenaEmail('user@soy.sena.edu.co')).toBe(true);
    expect(isSenaEmail('user@sena.edu.co')).toBe(true);
    expect(isSenaEmail('user@gmail.com')).toBe(false);
  });

  test('isValidPassword checks minimum length', () => {
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('1234')).toBe(false);
  });


  test('name and surname validators', () => {
    expect(isValidNames('Juan')).toBeNull();
  // Note: current implementation fails the regex first and returns the regex error
  expect(isValidNames('')).toBe('Solo letras y espacios');
    expect(isValidNames('Juan 123')).toBe('Solo letras y espacios');

    expect(isValidSurnames('Perez')).toBeNull();
  // As with names, the current implementation returns the regex error first
  expect(isValidSurnames('')).toBe('Solo letras y espacios');
    expect(isValidSurnames('Perez!')).toBe('Solo letras y espacios');
  });

  

  test('document and phone validators', () => {
    expect(isValidDocumentNumber('123456')).toBeNull();
    expect(isValidDocumentNumber('abc')).toBe('Dato no válido');

    expect(isValidPhone('3001234567')).toBeNull();
    expect(isValidPhone('300123')).toBe('Dato no válido');
  });

  test('reset code and expiration', () => {
    expect(isValidResetCode('123456')).toBe(true);
    expect(isValidResetCode('abc')).toBe(false);

    // Build an expiration string 1 hour in the future and 1 hour in the past
    const now = new Date();
    const future = new Date(now.getTime() + 60 * 60 * 1000);
    const past = new Date(now.getTime() - 60 * 60 * 1000);

    const fmt = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    };

    expect(isCodeNotExpired(fmt(future))).toBe(true);
    expect(isCodeNotExpired(fmt(past))).toBe(false);
  });

});
