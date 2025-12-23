import { CanActivateFn } from '@angular/router';
import { AccoutService } from '../services/accout-service';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccoutService);
  const toast = inject(ToastService);

  if (accountService.currentUser()?.roles.includes('Admin') 
    || accountService.currentUser()?.roles.includes('Moderator')) {
      return true;
    } else {
      toast.error('You do not have permission to access this area.');
      return false;
    }
};
