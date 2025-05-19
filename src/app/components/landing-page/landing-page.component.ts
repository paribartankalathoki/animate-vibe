import {
  Component,
  OnDestroy,
  signal,
  output,
  input,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  imports: [CountdownTimerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LandingPageComponent implements OnDestroy {
  public readonly headerText = input.required<string>();
  public readonly headerImage = input.required<string>();
  public readonly headerAnimated = input.required<string[]>();
  public readonly landingPageClicked = output<boolean>();
  public readonly countdownFinished = output<void>();
  public readonly typedOutput = signal('');
  public readonly showCountdown = signal(false);
  isActive = input<boolean>(false);
  private readonly typeSpeed = 150;
  private readonly eraseSpeed = 75;
  private phraseIndex = 0;
  private isTyping = signal<boolean>(false);
  private totalTypedPhrases = 0;
  private typingTimer: number | undefined;
  private erasingTimer: number | undefined;
  private isAnimating = false;

  constructor() {
    effect(() => {
      const active = this.isActive();
      if (active) {
        this.reset();
        this.startAnimation();
      } else {
        this.clearTimers();
        this.isAnimating = false;
      }
    });
  }

  startAnimation(): void {
    const phrases = this.headerAnimated();
    if (phrases?.length && !this.isAnimating) {
      this.isAnimating = true;
      this.startTypingEraseLoop();
    }
  }

  reset(): void {
    this.clearTimers();
    this.typedOutput.set('');
    this.showCountdown.set(false);
    this.phraseIndex = 0;
    this.isTyping.update(() => true);
    this.totalTypedPhrases = 0;
    this.isAnimating = false;
  }

  startTypingEraseLoop(): void {
    this.clearTimers();

    if (!this.isActive() || !this.isAnimating) return;

    this.typingTimer = window.setInterval(() => {
      if (!this.isActive() || !this.isAnimating) {
        this.clearTimers();
        return;
      }

      const currentPhrase = this.headerAnimated()?.[this.phraseIndex];

      if (this.isTyping()) {
        const typedOutput = this.typedOutput();
        if (typedOutput?.length < currentPhrase?.length) {
          this.typedOutput.set(typedOutput + currentPhrase[typedOutput.length]);
        } else {
          this.isTyping.update(() => false);
          this.startEraseLoop();
        }
      }
    }, this.typeSpeed);
  }

  startEraseLoop(): void {
    this.clearTimers();

    if (!this.isActive() || !this.isAnimating) return;

    this.erasingTimer = window.setInterval(() => {
      if (!this.isActive() || !this.isAnimating) {
        this.clearTimers();
        return;
      }

      const typedOutput = this.typedOutput();
      if (typedOutput?.length) {
        this.typedOutput.set(typedOutput.slice(0, -1));
      } else {
        this.totalTypedPhrases++;
        const animatedPhrases = this.headerAnimated();

        if (this.totalTypedPhrases === animatedPhrases?.length) {
          this.showCountdown.set(true);
        }

        this.phraseIndex = (this.phraseIndex + 1) % animatedPhrases?.length;
        this.isTyping.update(() => true);
        this.startTypingEraseLoop();
      }
    }, this.eraseSpeed);
  }

  onCountdownFinished(): void {
    this.countdownFinished.emit();
  }

  onClick(): void {
    this.landingPageClicked.emit(true);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = undefined;
    }

    if (this.erasingTimer) {
      clearInterval(this.erasingTimer);
      this.erasingTimer = undefined;
    }
  }
}
