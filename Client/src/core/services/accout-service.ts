import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { Register } from '../../features/account/register/register';


@Injectable({
  providedIn: 'root'
})
export class AccoutService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  baseUrl = 'https://localhost:5001/api/';

  register(creds: RegisterCreds) {
    return this.http.post<User>(this.baseUrl + 'account/register', creds).pipe(
      tap(user => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  emailExists(email: string) {
  return this.http.get<boolean>(this.baseUrl + 'account/email-exists', {
    params: { email }
  });
}


  login(creds: LoginCreds) {
    return this.http.post<User>(this.baseUrl + 'account/login', creds).pipe(
      tap(user => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  setCurrentUser(user: User) {
    user.roles = this.getRolesFromToken(user);
    localStorage.setItem('user', JSON.stringify(user))
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

 // private getRolesFromToken(user: User): string[] {
 //   const payload = user.token.split('.')[1];
 //   const decoded = atob(payload);
 //   const jsonPayload = JSON.parse(decoded);
 //   return Array.isArray(jsonPayload.role) ? jsonPayload.role : [jsonPayload.role]
 // }

  private getRolesFromToken(user: User): string[] {
  const token = user?.token;
  if (!token) return [];

  const payload = token.split('.')[1];
  if (!payload) return [];

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

  const decoded = atob(padded);
  const jsonPayload = JSON.parse(decoded);

  const roleClaim = jsonPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (!roleClaim) return [];

  return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
}


  loadCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) {
     this.currentUser.set(null);
    return;
  }

    const user: User = JSON.parse(userString);
    user.roles = this.getRolesFromToken(user);

    localStorage.setItem('user', JSON.stringify(user));

    this.currentUser.set(user);
  }
}
