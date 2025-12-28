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

  updateReservation(id: number, payload: { trainerName: string; date: string; startTime: string }) {
    return this.http.put<void>(`${this.apiBase}/${id}`, payload);
  }
  getReservedSlots(trainerName: string, date: string) {
    return this.http.get<string[]>(`${this.apiBase}/reserved`, {
      params: { trainerName, date }
    });
  }
}