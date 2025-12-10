import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccoutService } from '../../core/services/accout-service';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ToastService } from '../../core/services/toast-service';
import { themes } from '../theme';
@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  protected accountService = inject(AccoutService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected creds: any = {}
  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
  protected themes = themes;

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
  }

  handleSelectTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const elem = document.activeElement as HTMLDivElement;
    if (elem) elem.blur();
  }


  login() {
    this.accountService.login(this.creds).subscribe({
      next: () => {
        this.router.navigateByUrl('/membership');
        this.toast.success('Logged in successfully');
        this.creds = {};
      },
      error: error => {
        this.toast.error(error.error.title); // sa .title radi bez njega ne radi, ako bude greski kasnije skloni .title pa vidi kako ces rijestii [object Object]
      }
    })
  } 

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
