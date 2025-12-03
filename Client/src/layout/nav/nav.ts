import { Component, inject, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccoutService } from '../../core/services/accout-service';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected accountService = inject(AccoutService);
  private router = inject(Router);
  protected creds: any = {}

  login() {
    this.accountService.login(this.creds).subscribe({
      next: result => {
        this.router.navigateByUrl('/membership');
        this.creds = {};
      },
      error: error => alert(error.message)
    });
  } 

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
