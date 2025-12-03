import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast-service';
import { AccoutService } from '../services/accout-service';

export const authGuard: CanActivateFn = () => {
  const accoutService = inject(AccoutService);
  const toast = inject(ToastService);

  if (accoutService.currentUser()) return true;
  else  {
    toast.error('You must be logged in to access this page.');
    return false;
  }
};
