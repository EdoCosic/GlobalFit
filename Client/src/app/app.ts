import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Nav } from "../layout/nav/nav";
import { AccoutService } from '../core/services/accout-service';

@Component({
  selector: 'app-root',
  imports: [Nav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  private accoutService = inject(AccoutService);
  private http = inject(HttpClient);
  protected title = 'GlobalFit';
  protected members = signal<any>([]) 

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
      return await lastValueFrom(this.http.get('https://localhost:5001/api/members'));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}
