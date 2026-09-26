import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordsMatchValidator(
  passwordField = 'password',
  confirmationField = 'confirmPassword',
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField)?.value;
    const confirmation = control.get(confirmationField)?.value;

    if (!password || !confirmation) {
      return null;
    }

    return password === confirmation ? null : { passwordMismatch: true };
  };
}
