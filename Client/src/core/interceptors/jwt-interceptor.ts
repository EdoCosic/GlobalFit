import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccoutService } from '../services/accout-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccoutService);
  const user = accountService.currentUser();

  if (user?.token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${user.token}` }
    });
  }

  return next(req);
};
