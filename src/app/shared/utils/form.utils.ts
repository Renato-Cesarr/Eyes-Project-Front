import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class FormUtils {
  // Exemplo de validador customizado compartilhado
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) return null;

      const hasUpperCase = /[A-Z]+/.test(value);
      const hasLowerCase = /[a-z]+/.test(value);
      const hasNumeric = /[0-9]+/.test(value);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;

      if (!passwordValid) {
        return { strongPassword: true };
      }

      return null;
    };
  }

  // Marcar todos os campos como "touched" para disparar os avisos de erro na UI
  static markAllAsTouched(formGroup: any): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}
