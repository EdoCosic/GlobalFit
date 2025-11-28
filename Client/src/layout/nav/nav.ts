import { Component, inject, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccoutService } from '../../core/services/accout-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected accountService = inject(AccoutService)
  protected creds: any = {}

  login() {
    this.accountService.login(this.creds).subscribe({
      next: result => {
        console.log(result);
        this.creds = {};
      },
      error: error => alert(error.message)
    });
  } 

  logout() {
    this.accountService.logout();
  }
}
