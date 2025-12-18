import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

type Slot = { label: string; value: string };

@Component({
  selector: 'app-program',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './program.html',
})
export class Program {
  @ViewChild('trainerSwiper', { static: false })
  trainerSwiper!: ElementRef<any>;

  // od sutra pa nadalje
  tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
    .toISOString()
    .split('T')[0];

  // =============== SLOTS (08:00 do 18:00) ===============
  allSlots: Slot[] = this.buildHourlySlots(8, 18); // 08-09 ... 18-19

  private buildHourlySlots(fromHour: number, toHour: number): Slot[] {
    const slots: Slot[] = [];
    for (let h = fromHour; h <= toHour; h++) {
      const start = `${String(h).padStart(2, '0')}:00`;
      const end = `${String(h + 1).padStart(2, '0')}:00`;
      slots.push({ value: start, label: `${start} – ${end}` });
    }
    return slots;
  }

  // =============== STATE (modal) ===============
  selectedTrainer = '';
  selectedDate = '';
  selectedTime = '';

  availableSlots: Slot[] = [...this.allSlots];

  trainerError = '';
  dateError = '';
  timeError = '';

  // =============== "FAKE BAZA" REZERVACIJA ===============
  // reserved[trainerName][date] = ['14:00','16:00', ...]
  reservedByTrainerAndDate: Record<string, Record<string, string[]>> = {
    'Ana Ivanović': {
      '2025-12-21': ['10:00', '16:00'],
    },
    'Petar Sučić': {
      '2025-12-23': ['08:00', '18:00'],
    },
    'Ema Marić': {
      // prazno za sada
    },
  };

  // =============== UI helpers ===============
  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  nextTrainer() {
    this.trainerSwiper?.nativeElement?.swiper?.slideNext();
  }

  prevTrainer() {
    this.trainerSwiper?.nativeElement?.swiper?.slidePrev();
  }

  // =============== MODAL LOGIC ===============
  onTrainerChange(value: string) {
    this.selectedTrainer = value;

    this.trainerError = '';
    this.dateError = '';
    this.timeError = '';

    // resetuj izbor datuma/vremena kad promijeni trenera
    this.selectedDate = '';
    this.selectedTime = '';
    this.availableSlots = [...this.allSlots];
  }

  onDateChange(value: string, inputEl: HTMLInputElement) {
    this.dateError = '';
    this.timeError = '';
    this.trainerError = '';

    // trainer mora biti prvo
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

    if (!value) return;

    // Sunday = 0
    const day = new Date(value + 'T00:00:00').getDay();
    if (day === 0) {
      this.dateError = 'Sundays are not available. Please choose another day.';
      inputEl.value = '';
      this.selectedDate = '';
      this.availableSlots = [...this.allSlots];
      return;
    }

    // filter slotova po treneru+datumu
    const reservedForThis = new Set(
      this.reservedByTrainerAndDate?.[this.selectedTrainer]?.[value] ?? []
    );

    this.availableSlots = this.allSlots.filter(s => !reservedForThis.has(s.value));

    if (this.availableSlots.length === 0) {
      this.dateError = 'No time slots available for this date. Please choose another date.';
      inputEl.value = '';
      this.selectedDate = '';
      this.availableSlots = [...this.allSlots];
    }
  }

  onTimeChange(value: string) {
    this.selectedTime = value;
    this.timeError = '';
  }

  confirmReservation() {
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

    // upiši rezervaciju u "fake bazu"
    if (!this.reservedByTrainerAndDate[this.selectedTrainer]) {
      this.reservedByTrainerAndDate[this.selectedTrainer] = {};
    }
    if (!this.reservedByTrainerAndDate[this.selectedTrainer][this.selectedDate]) {
      this.reservedByTrainerAndDate[this.selectedTrainer][this.selectedDate] = [];
    }

    const list = this.reservedByTrainerAndDate[this.selectedTrainer][this.selectedDate];

    // safety: ako je već rezervisano (ne bi trebalo da se desi)
    if (list.includes(this.selectedTime)) {
      this.timeError = 'This time slot has just been booked. Please choose another.';
      // osvježi slotove
      this.refreshAvailableSlots();
      return;
    }

    list.push(this.selectedTime);

    // nakon rezervacije, ukloni slot iz dostupnih (odmah se vidi u UI)
    this.refreshAvailableSlots();

    // zatvori modal
    const modalToggle = document.getElementById('reserve-modal') as HTMLInputElement | null;
    if (modalToggle) modalToggle.checked = false;

    // demo feedback
    alert(
      `Reserved (demo): ${this.selectedTrainer} on ${this.selectedDate} at ${this.selectedTime}`
    );

    // reset time (opcionalno)
    this.selectedTime = '';
  }

  private refreshAvailableSlots() {
    if (!this.selectedTrainer || !this.selectedDate) {
      this.availableSlots = [...this.allSlots];
      return;
    }

    const reservedForThis = new Set(
      this.reservedByTrainerAndDate?.[this.selectedTrainer]?.[this.selectedDate] ?? []
    );

    this.availableSlots = this.allSlots.filter(s => !reservedForThis.has(s.value));
  }
}
