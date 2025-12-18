import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast-service';

type Slot = { label: string; value: string };

@Component({
  selector: 'app-program',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './program.html'
})
export class Program {

  private apiBase = 'https://localhost:5001/api/TrainingReservations';

  @ViewChild('trainerSwiper', { static: false })
  trainerSwiper!: ElementRef<any>;

  tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
    .toISOString()
    .split('T')[0];

  trainers: string[] = ['Ana Ivanović', 'Petar Sučić', 'Ema Marić'];

  allSlots: Slot[] = this.buildHourlySlots(8, 18);
  availableSlots: Slot[] = [...this.allSlots];

  selectedTrainer = '';
  selectedDate = '';
  selectedTime = '';

  trainerError = '';
  dateError = '';
  timeError = '';

  constructor(
    private http: HttpClient,
    private toast: ToastService
  ) {}

  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  nextTrainer(): void {
    this.trainerSwiper?.nativeElement?.swiper?.slideNext();
  }

  prevTrainer(): void {
    this.trainerSwiper?.nativeElement?.swiper?.slidePrev();
  }

  onModalChange(isOpen: boolean): void {
    if (!isOpen) this.resetModal();
  }

  resetModal(): void {
    this.selectedTrainer = '';
    this.selectedDate = '';
    this.selectedTime = '';

    this.availableSlots = [...this.allSlots];

    this.trainerError = '';
    this.dateError = '';
    this.timeError = '';

    const dateEl = document.getElementById('dateInputReal') as HTMLInputElement | null;
    if (dateEl) dateEl.value = '';
  }

  onTrainerChange(value: string): void {
    this.selectedTrainer = value;

    this.trainerError = '';
    this.dateError = '';
    this.timeError = '';

    this.selectedDate = '';
    this.selectedTime = '';
    this.availableSlots = [...this.allSlots];

    const dateEl = document.getElementById('dateInputReal') as HTMLInputElement | null;
    if (dateEl) dateEl.value = '';
  }

  onDateChange(value: string, inputEl: HTMLInputElement): void {
    this.trainerError = '';
    this.dateError = '';
    this.timeError = '';

    if (!this.selectedTrainer) {
      this.trainerError = 'Please select a trainer first.';
      inputEl.value = '';
      this.selectedDate = '';
      this.selectedTime = '';
      this.availableSlots = [...this.allSlots];
      return;
    }

    this.selectedDate = value;
    this.selectedTime = '';
    this.availableSlots = [];

    if (!value) {
      this.availableSlots = [...this.allSlots];
      return;
    }

    const day = new Date(value + 'T00:00:00').getDay();
    if (day === 0) {
      this.dateError = 'Sundays are not available. Please choose another day.';
      inputEl.value = '';
      this.selectedDate = '';
      this.availableSlots = [...this.allSlots];
      return;
    }

    const url = this.getReservedUrl(this.selectedTrainer, value);

    this.http.get<string[]>(url).subscribe({
      next: (reservedTimes) => {
        const reservedSet = new Set((reservedTimes ?? []).map((t) => (t ?? '').slice(0, 5)));
        this.availableSlots = this.allSlots.filter((s) => !reservedSet.has(s.value));

        if (this.availableSlots.length === 0) {
          this.dateError = 'No time slots available for this date. Please choose another date.';
          inputEl.value = '';
          this.selectedDate = '';
          this.availableSlots = [...this.allSlots];
        }
      },
      error: (err) => {
        console.error(err);
        this.dateError = 'Failed to load reserved slots (API).';
        this.availableSlots = [...this.allSlots];
      }
    });
  }

  onTimeChange(value: string): void {
    this.selectedTime = value;
    this.timeError = '';
  }

  confirmReservation(): void {
    this.trainerError = '';
    this.dateError = '';
    this.timeError = '';

    if (!this.selectedTrainer) {
      this.trainerError = 'Please select a trainer.';
      return;
    }

    if (!this.selectedDate) {
      this.dateError = 'Please choose a valid date.';
      return;
    }

    if (!this.selectedTime) {
      this.timeError = 'Please choose a time slot.';
      return;
    }

    this.http.post(`${this.apiBase}`, {
      trainerName: this.selectedTrainer,
      date: this.selectedDate,
      startTime: this.selectedTime
    }).subscribe({
      next: () => {
        this.refreshAvailableSlotsFromApi();

        this.toast.success('Reserved successfully', 3500);

        const modalToggle = document.getElementById('reserve-modal') as HTMLInputElement | null;
        if (modalToggle) modalToggle.checked = false;

        this.resetModal();
      },
      error: (err) => {
        if (err?.status === 409) {
          this.timeError = 'This time slot is already reserved. Please choose another.';
          this.refreshAvailableSlotsFromApi();
          this.toast.warning(this.timeError, 4000);
          return;
        }

        this.timeError = 'Reservation failed. Please try again.';
        this.toast.error(this.timeError, 4000);
      }
    });
  }

  private refreshAvailableSlotsFromApi(): void {
    if (!this.selectedTrainer || !this.selectedDate) {
      this.availableSlots = [...this.allSlots];
      return;
    }

    const url = this.getReservedUrl(this.selectedTrainer, this.selectedDate);

    this.http.get<string[]>(url).subscribe({
      next: (reservedTimes) => {
        const reservedSet = new Set((reservedTimes ?? []).map((t) => (t ?? '').slice(0, 5)));
        this.availableSlots = this.allSlots.filter((s) => !reservedSet.has(s.value));
      },
      error: () => {
        this.availableSlots = [...this.allSlots];
      }
    });
  }

  private getReservedUrl(trainerName: string, date: string): string {
    return (
      `${this.apiBase}/reserved?trainerName=` +
      encodeURIComponent(trainerName) +
      `&date=${encodeURIComponent(date)}`
    );
  }

  private buildHourlySlots(fromHour: number, toHour: number): Slot[] {
    const slots: Slot[] = [];

    for (let h = fromHour; h <= toHour; h++) {
      const start = `${String(h).padStart(2, '0')}:00`;
      const end = `${String(h + 1).padStart(2, '0')}:00`;
      slots.push({ value: start, label: `${start} – ${end}` });
    }

    return slots;
  }
}