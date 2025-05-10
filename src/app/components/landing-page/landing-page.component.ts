import {CommonModule} from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import {Router, RouterModule} from "@angular/router";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, CountdownTimerComponent]
})
export class LandingPageComponent implements OnInit, OnDestroy {
  @Input() headerText: string = '';
  @Input() headerAnimated: string[] = [];
  @Input() headerImage: string = '';
  @Output() countdownFinished = new EventEmitter<void>();
  typedOutput = signal<string>('');
  showCountdown = signal<boolean>(false);
  private typeSpeed = 150;
  private eraseSpeed = 75;
  private phraseIndex = 0;
  private isTyping = true;
  private totalTypedPhrases = 0;
  private typingTimer: number | undefined;
  private erasingTimer: number | undefined;
  private router = inject(Router);


  ngOnInit(): void {
    this.startTypingEraseLoop();
  }

  startTypingEraseLoop(): void {
    this.clearTimers();
    this.typingTimer = window.setInterval(() => {
      const currentPhrase = this.headerAnimated[this.phraseIndex];

      if (this.isTyping) {
        if (this.typedOutput().length < currentPhrase.length) {
          this.typedOutput.set(this.typedOutput() + currentPhrase[this.typedOutput().length]);
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
      if (this.typedOutput().length > 0) {
        this.typedOutput.set(this.typedOutput().slice(0, -1));
      } else {
        this.totalTypedPhrases++;

        if (this.totalTypedPhrases === this.headerAnimated.length) {
          this.showCountdown.set(true);
        }

        this.phraseIndex = (this.phraseIndex + 1) % this.headerAnimated.length;
        this.isTyping = true;
        this.startTypingEraseLoop();
      }
    }, this.eraseSpeed);
  }

  onCountdownFinished(): void {
    this.countdownFinished.emit();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  onClick(): void {
    this.router.navigate(['/chat']);
  }

  private clearTimers(): void {
    if (this.typingTimer) {
      window.clearInterval(this.typingTimer);
      this.typingTimer = undefined;
    }

    if (this.erasingTimer) {
      window.clearInterval(this.erasingTimer);
      this.erasingTimer = undefined;
    }
  }
}
