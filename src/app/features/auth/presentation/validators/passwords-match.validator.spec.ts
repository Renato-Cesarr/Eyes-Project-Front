import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { passwordsMatchValidator } from './passwords-match.validator';

describe('passwordsMatchValidator', () => {
  it('accepts matching values', () => {
    const form = formWith('same-password', 'same-password');

    expect(passwordsMatchValidator()(form)).toBeNull();
  });

  it('rejects different values', () => {
    const form = formWith('first-password', 'second-password');

    expect(passwordsMatchValidator()(form)).toEqual({ passwordMismatch: true });
  });

  it('lets required validators report empty values', () => {
    const form = formWith('', '');

    expect(passwordsMatchValidator()(form)).toBeNull();
  });
});

function formWith(password: string, confirmPassword: string): FormGroup {
  return new FormGroup({
    password: new FormControl(password),
    confirmPassword: new FormControl(confirmPassword),
  });
}
