import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

type StrengthLabel = 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';

type Strength = {
  score: number;
  percent: number;
  label: StrengthLabel;
};

@Component({
  selector: 'app-text-input',
  imports: [ReactiveFormsModule],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css',
})
export class TextInput implements ControlValueAccessor {

  label = input<string>();
  type = input<string>('text');

  showStrength = input<boolean>(false);

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
  }

  writeValue(obj: any): void {
  }
  registerOnChange(fn: any): void {
  }
  registerOnTouched(fn: any): void {
  }

  get control(): FormControl {
    return this.ngControl.control as FormControl
  }

  protected get passwordStrength(): Strength {
    const p = (this.control?.value ?? '') as string;
    return this.calcPasswordStrength(p);
  }

  private calcPasswordStrength(password: string): Strength {
    const p = password ?? '';
    if (!p.length) return { score: 0, percent: 0, label: 'Too short' };

    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasNumber = /\d/.test(p);
    const hasSymbol = /[^A-Za-z0-9]/.test(p);
    const variety = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

    if (p.length <= 3) {
      return { score: 0, percent: Math.min(20, p.length * 6), label: 'Too short' };
    }

    let label: StrengthLabel;
    if (p.length === 8 && variety === 4) label = 'Strong';
    else if ((p.length >= 7 && variety === 4) || (p.length === 8 && variety >= 3)) label = 'Good';
    else if (p.length >= 6 && variety >= 2) label = 'Fair';
    else label = 'Weak';

    const scoreMap: Record<StrengthLabel, number> = {
      'Too short': 0,
      'Weak': 1,
      'Fair': 2,
      'Good': 3,
      'Strong': 4
    };

    const score = scoreMap[label];

    const lengthPart = Math.max(0, Math.min(60, ((p.length - 4) / 4) * 60));
    const varietyPart = Math.max(0, Math.min(40, ((variety - 1) / 3) * 40));
    const percent = Math.round(Math.min(100, lengthPart + varietyPart));

    return { score, percent, label };
  }
}
