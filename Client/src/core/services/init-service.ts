import { inject, Injectable } from '@angular/core';
import { AccoutService } from './accout-service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private accountService = inject(AccoutService);

  init() {
    const userString = localStorage.getItem('user');
    if (!userString) return of(null);
    const user = JSON.parse(userString);
    this.accountService.loadCurrentUser();

    return of(null)
  }
}
