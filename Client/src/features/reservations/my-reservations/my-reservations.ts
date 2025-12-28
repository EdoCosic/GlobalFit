import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast-service';
import { TrainingReservationsService } from '../../../core/services/training-reservations-service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';


type MyReservation = {
  id: number;
  trainerName: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAtUtc: string;
};

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.css'
})
export class MyReservations implements OnInit {
  private trainingReservationsService = inject(TrainingReservationsService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected reservations = signal<MyReservation[]>([]);
  protected loading = signal<boolean>(true);
  protected cancellingId = signal<number | null>(null);

  protected reservedTimes = signal<string[]>([]);

  filteredTimes() {
    const r = this.selectedReservation();
    const reserved = new Set(this.reservedTimes());

    if (r) reserved.delete(r.startTime);
    return this.allowedTimes.filter(t => !reserved.has(t));
  }


  private fb = inject(FormBuilder);

  protected updateForm = this.fb.nonNullable.group({
    trainerName: ['', Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required]
  });


  protected updating = signal<boolean>(false);
  protected selectedReservation = signal<MyReservation | null>(null);

  protected allowedTimes = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  addHour(t: string): string {
    const [h, m] = t.split(':').map(Number);
    const hh = (h + 1).toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  protected sortBy = signal<'asc' | 'desc'>('asc');
  protected sortedReservations = signal<MyReservation[]>([]);

  ngOnInit(): void {
    this.loadReservations();

    this.updateForm.valueChanges.subscribe(v => {
      const trainer = v.trainerName;
      const date = v.date;

      if (!trainer || !date) {
        this.reservedTimes.set([]);
        return;
      }

      this.trainingReservationsService.getReservedSlots(trainer, date).subscribe({
        next: (times) => {
          this.reservedTimes.set(times || []);

          const current = this.updateForm.get('startTime')?.value;
          const allowed = this.filteredTimes();
          if (current && !allowed.includes(current)) {
            this.updateForm.patchValue({ startTime: '' });
          }
        },
        error: () => this.reservedTimes.set([])
      });
    });
  }

  applySorting() {
    const sorted = [...this.reservations()].sort((a, b) => {
      const da = new Date(`${a.date}T${a.startTime}:00`).getTime();
      const db = new Date(`${b.date}T${b.startTime}:00`).getTime();
      return this.sortBy() === 'asc' ? da - db : db - da;
    });
    this.sortedReservations.set(sorted);
  }

  changeSort(value: 'asc' | 'desc') {
    this.sortBy.set(value);
    this.applySorting();
  }

  loadReservations() {
    this.loading.set(true);

    this.trainingReservationsService.getMyReservations().subscribe({
      next: items => {
        const data = items || [];
        this.reservations.set(data);
        this.applySorting();
        this.loading.set(false);
      },
      error: () => {
        this.reservations.set([]);
        this.sortedReservations.set([]);
        this.loading.set(false);
      }
    })
  }

  goToProgram() {
    this.router.navigateByUrl('/program');
  }

  canUpdate(r: MyReservation): boolean {
    const start = new Date(`${r.date}T${r.startTime}:00`);

    const limit = new Date();
    limit.setHours(limit.getHours() + 24);

    return start.getTime() >= limit.getTime();
  }

  cancel(id: number) {
    this.cancellingId.set(id);

    this.trainingReservationsService.cancelReservation(id).subscribe({
      next: () => {
        this.toast.success('Reservation canceled');
        this.reservations.set(this.reservations().filter(x => x.id !== id));
        this.applySorting();
        this.cancellingId.set(null);
      },
      error: () => {
        this.toast.error('Could not cancel reservation');
        this.cancellingId.set(null);
      }
    })
  }

  openUpdate(r: MyReservation) {
    this.selectedReservation.set(r);

    this.updateForm.patchValue({
      trainerName: r.trainerName,
      date: r.date,
      startTime: r.startTime
    });

    this.updateForm.markAsPristine();
    this.updateForm.markAsUntouched();

    const dlg = document.getElementById('update_modal') as HTMLDialogElement | null;
    dlg?.showModal();
  }


  closeUpdate() {
    const dlg = document.getElementById('update_modal') as HTMLDialogElement | null;
    dlg?.close();
    this.selectedReservation.set(null);
    this.updating.set(false);

    this.updateForm.reset({
      trainerName: '',
      date: '',
      startTime: ''
    });
  }

  saveUpdate() {
    const r = this.selectedReservation();
    if (!r) return;

    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      this.toast.error('Please fill all fields correctly');
      return;
    }

    this.updating.set(true);

    const payload = this.updateForm.getRawValue();

    this.trainingReservationsService.updateReservation(r.id, payload).subscribe({
      next: () => {
        this.toast.success('Reservation updated');
        this.closeUpdate();
        this.loadReservations();
      },
      error: (err) => {
        const msg = err?.error ?? 'Could not update reservation';
        this.toast.error(msg);
        this.updating.set(false);
      }
    });
  }
}