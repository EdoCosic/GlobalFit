import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import { AccoutService } from '../../core/services/accout-service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRole implements OnInit {
  @Input() appHasRole: string[] = [];

  private accountService = inject(AccoutService);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);

  ngOnInit(): void {
    if (this.accountService.currentUser()?.roles.some(r => this.appHasRole.includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
  } else {
      this.viewContainerRef.clear();
    }
  }
}
