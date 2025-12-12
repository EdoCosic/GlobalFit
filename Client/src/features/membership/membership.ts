import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MembershipPlan {
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  highlight?: string;
}

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membership.html'
})
export class MembershipComponent implements OnInit {

  quotes: string[] = [
    'The best workout is the one you actually do.',
    'Small steps every day lead to big changes.',
    'You don’t have to be extreme, just consistent.',
    'Stronger every session, not overnight.',
    'Discipline beats motivation every single time.',
    'One workout is one vote for the person you want to become.',
    'Your body can, it’s your mind you have to convince.',
    'Sweat now, shine later.',
    'Health is an investment, not an expense.',
    'Future you will thank you for today’s effort.'
  ];

  quote = '';

  membershipPlans: MembershipPlan[] = [
    {
      name: 'Daily pass',
      price: 10,
      currency: 'KM',
      period: 'day',
      description: 'Ideal if you just want a single training session.'
    },
    {
      name: 'Standard',
      price: 70,
      currency: 'KM',
      period: 'month',
      description: 'Full gym access for regular training and consistent progress.',
      highlight: 'Most popular'
    },
    {
      name: 'Student',
      price: 50,
      currency: 'KM',
      period: 'month',
      description: 'Discounted membership for students with a valid student ID.',
      highlight: 'Student deal'
    }
  ];

  bmi: number | null = null;
  bmiError: string = 'Please enter your height and weight.';

  ngOnInit(): void {
    const index = Math.floor(Math.random() * this.quotes.length);
    this.quote = this.quotes[index];
  }

  calculateBMI(heightCmStr: string, weightKgStr: string): void {
    const heightCm = Number(heightCmStr);
    const weightKg = Number(weightKgStr);

    if (!heightCm || !weightKg || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
      this.bmi = null;
      this.bmiError = 'Please enter your height and weight.';
      return;
    }

    if (heightCm < 120 || heightCm > 250 || weightKg < 50 || weightKg > 250) {
      this.bmi = null;
      this.bmiError = 'Please enter realistic values.';
      return;
    }

    const heightM = heightCm / 100;
    const value = weightKg / (heightM * heightM);

    this.bmiError = '';
    this.bmi = Math.round(value * 10) / 10;
  }
}
