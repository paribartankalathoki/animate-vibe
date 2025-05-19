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

  private readonly typeSpeed = 150;
  private readonly eraseSpeed = 75;
  private phraseIndex = 0;
  private isTyping = true;
  private totalTypedPhrases = 0;
  private typingTimer: number | undefined;
  private erasingTimer: number | undefined;

  constructor() {
    effect(() => {
      if (this.headerAnimated()?.length) {
        this.startTypingEraseLoop();
      }
    });
  }

  startTypingEraseLoop(): void {
    this.clearTimers();
    this.typingTimer = window.setInterval(() => {
      const currentPhrase = this.headerAnimated()?.[this.phraseIndex];

      if (this.isTyping) {
        const typedOutput = this.typedOutput();
        if (typedOutput?.length < currentPhrase?.length) {
          this.typedOutput.set(typedOutput + currentPhrase[typedOutput.length]);
        } else {
          this.isTyping = false;
          this.startEraseLoop();
        }
      }
    }, this.typeSpeed);
  }

  startEraseLoop(): void {
    this.clearTimers();
    this.erasingTimer = window.setInterval(() => {
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
        this.isTyping = true;
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
