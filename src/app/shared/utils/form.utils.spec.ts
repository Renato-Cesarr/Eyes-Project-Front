import { FormControl, FormGroup } from '@angular/forms';
import { FormUtils } from './form.utils';
import { describe, it, expect } from 'vitest';

describe('FormUtils', () => {
  describe('strongPassword', () => {
    const validator = FormUtils.strongPassword();

    it('should return null if control value is empty', () => {
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should return error if password is missing upper case', () => {
      const control = new FormControl('abcd123!');
      expect(validator(control)).toEqual({ strongPassword: true });
    });

    it('should return error if password is missing lower case', () => {
      const control = new FormControl('ABCD123!');
      expect(validator(control)).toEqual({ strongPassword: true });
    });

    it('should return error if password is missing numeric', () => {
      const control = new FormControl('abcdABCD!');
      expect(validator(control)).toEqual({ strongPassword: true });
    });

    it('should return error if password is missing special character', () => {
      const control = new FormControl('abcdABCD123');
      expect(validator(control)).toEqual({ strongPassword: true });
    });

    it('should return null if password is valid (strong)', () => {
      const control = new FormControl('Ab1!aaaa');
      expect(validator(control)).toBeNull();
    });
  });

  describe('markAllAsTouched', () => {
    it('should mark all controls as touched', () => {
      const form = new FormGroup({
        name: new FormControl(''),
        email: new FormControl('')
      });

      expect(form.get('name')?.touched).toBe(false);
      expect(form.get('email')?.touched).toBe(false);

      FormUtils.markAllAsTouched(form);

      expect(form.get('name')?.touched).toBe(true);
      expect(form.get('email')?.touched).toBe(true);
    });
  });
});
