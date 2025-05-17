import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-error-popup',
  imports: [
    RouterLink
  ],
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPopupComponent {
  @Input() message: string = 'An error occurred.';
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
