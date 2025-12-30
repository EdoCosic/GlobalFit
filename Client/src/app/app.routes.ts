import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { adminGuard } from '../core/guards/admin-guard';
import { NotFound } from '../shared/errors/not-found/not-found';
import { ServerError } from '../shared/errors/server-error/server-error';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../features/home/home').then(m => m.Home),
  },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'membership',
        loadComponent: () =>
          import('../features/membership/membership').then(m => m.MembershipComponent),
      },
      {
        path: 'program',
        loadComponent: () =>
          import('../features/program/program').then(m => m.Program),
      },
      {
        path: 'shop',
        loadComponent: () =>
          import('../features/shop/shop').then(m => m.Shop),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('../features/messages/messages').then(m => m.Messages),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('../features/reviews/reviews').then(m => m.Reviews),
      },
      {
        path: 'my-reservations',
        loadComponent: () =>
          import('../features/reservations/my-reservations/my-reservations').then(
            m => m.MyReservations
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('../features/admin/admin').then(m => m.Admin),
  },
  {
    path: 'errors',
    loadComponent: () =>
      import('../features/test-errors/test-errors').then(m => m.TestErrors),
  },
  { path: 'server-error', component: ServerError },
  { path: '**', component: NotFound },
];
