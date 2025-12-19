import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TrainingReservationsService {
  private http = inject(HttpClient);
  private apiBase = 'https://localhost:5001/api/TrainingReservations';

  getMyReservations() {
    return this.http.get<any[]>(`${this.apiBase}/my`);
  }

  cancelReservation(id: number) {
    return this.http.delete(`${this.apiBase}/${id}`);
  }
}