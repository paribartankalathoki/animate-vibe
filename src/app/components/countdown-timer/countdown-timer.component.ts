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
  template: `
    <div class="fixed bottom-5 right-5 w-10 h-10 z-[1000]">
      <svg class="w-full h-full" viewBox="0 0 36 36">
        <path
          class="fill-none stroke-[rgba(0,0,0,0.6)]"
          stroke-width="4.5"
          d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path
          class="fill-none stroke-gray-100 transition-[stroke-dasharray] duration-1000 ease-linear"
          stroke-width="4.5"
          stroke-linecap="round"
          [attr.stroke-dasharray]="dashArray() + ', 100'"
          d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831" />
        <text
          x="18"
          y="22.35"
          class="fill-gray-100 text-[0.9rem] text-center font-[Poppins]"
          text-anchor="middle">
          {{ countdown() }}
        </text>
      </svg>
    </div>
  `,
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() initialValue = 10;
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

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.countdownTimer) {
      window.clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }
}
