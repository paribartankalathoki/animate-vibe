import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-countdown-timer',
  imports: [],
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() initialValue: number = 10;
  @Output() countdownFinished = new EventEmitter<void>();
  private timeLeft = signal<number>(this.initialValue);
  countdown = computed(() => this.timeLeft());
  dashArray = computed(() => (this.timeLeft() / this.initialValue) * 100);
  private countdownTimer: number | undefined;

  ngOnInit(): void {
    this.timeLeft.set(this.initialValue);
    this.startCountdown();
  }

  startCountdown(): void {
    this.countdownTimer = window.setInterval(() => {
      this.timeLeft.update((val: any) => val - 1);

      if (this.timeLeft() <= 0) {
        this.clearTimer();
        this.countdownFinished.emit();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.countdownTimer) {
      window.clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

}
