import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-countdown-timer',
  imports: [],
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() initialValue: number = 10;
  @Output() countdownFinished = new EventEmitter<void>();
  timeLeft = signal<number>(this.initialValue);
  countdown = computed(() => this.timeLeft());
  dashArray = computed(() => (this.timeLeft() / this.initialValue) * 100);

  countdownActive = signal<boolean>(false);

  private timerId: any;

  ngOnInit(): void {
    this.timeLeft.set(this.initialValue);
    this.startCountdown();
  }

  startCountdown(): void {
    this.countdownActive.set(true);

    this.timerId = setInterval(() => {
      if (this.countdownActive()) {
        this.timeLeft.update((val) => val - 1);

        if (this.timeLeft() <= 0) {
          this.clearTimer();
          this.countdownFinished.emit();
        }
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
    this.countdownActive.set(false);
  }
}
