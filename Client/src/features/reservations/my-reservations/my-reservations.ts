import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast-service';
import { TrainingReservationsService } from '../../../core/services/training-reservations-service';


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

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);

    this.trainingReservationsService.getMyReservations().subscribe({
      next: items => {
        this.reservations.set(items || []);
        this.loading.set(false);
      },
      error: () => {
        this.reservations.set([]);
        this.loading.set(false);
      }
    })
  }

  goToProgram() {
    this.router.navigateByUrl('/program');
  }

  cancel(id: number) {
    this.cancellingId.set(id);

    this.trainingReservationsService.cancelReservation(id).subscribe({
      next: () => {
        this.toast.success('Reservation canceled');
        this.reservations.set(this.reservations().filter(x => x.id !== id));
        this.cancellingId.set(null);
      },
      error: () => {
        this.toast.error('Could not cancel reservation');
        this.cancellingId.set(null);
      }
    })
  }
}
