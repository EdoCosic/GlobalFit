import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Nav } from "../layout/nav/nav";
import { AccoutService } from '../core/services/accout-service';
import { User } from '../types/user';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Nav, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  private accoutService = inject(AccoutService);
  protected router = inject(Router);
  private http = inject(HttpClient);
  protected title = 'GlobalFit';
  protected members = signal<User[]>([]) 

  async ngOnInit() {
    this.members.set(await this.getmembers());
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    this.accoutService.currentUser.set(user);
  }

  async getmembers() {
    try {
      return await lastValueFrom(this.http.get<User[]>('https://localhost:5001/api/members'));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}
