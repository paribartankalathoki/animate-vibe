import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ChangeDetectionStrategy
} from "@angular/core";
import {RouterModule} from "@angular/router";
import {CountdownTimerComponent} from "../countdown-timer/countdown-timer.component";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  imports: [RouterModule, CountdownTimerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LandingPageComponent implements OnInit, OnDestroy {
  @Input() headerText: string = '';
  @Input() headerAnimated: string[] = [];
  @Input() headerImage: string = '';
  @Output() countdownFinished = new EventEmitter<void>();
  @Output() landingPageClicked = new EventEmitter<any>(false);
  typedOutput = signal<string>('');
  showCountdown = signal<boolean>(false);
  isTyping = signal<boolean>(true);
  phraseIndex = signal<number>(0);
  totalTypedPhrases = signal<number>(0);

  private typeSpeed = 150;
  private eraseSpeed = 75;

  private typingTimeout: any;
  private erasingTimeout: any;

  ngOnInit(): void {
    this.startTypingEraseLoop();
  }

  startTypingEraseLoop(): void {
    const currentPhrase = this.headerAnimated[this.phraseIndex()];

    if (this.isTyping()) {
      this.typingTimeout = setTimeout(() => {
        if (this.typedOutput().length < currentPhrase.length) {
          this.typedOutput.set(this.typedOutput() + currentPhrase[this.typedOutput().length]);
          this.startTypingEraseLoop();
        } else {
          this.isTyping.set(false);
          this.startEraseLoop();
        }
      }, this.typeSpeed);
    }
  }

  startEraseLoop(): void {
    if (!this.isTyping()) {
      this.erasingTimeout = setTimeout(() => {
        if (this.typedOutput().length > 0) {
          this.typedOutput.set(this.typedOutput().slice(0, -1));
          this.startEraseLoop();
        } else {
          this.totalTypedPhrases.update((val) => val + 1);
          if (this.totalTypedPhrases() === this.headerAnimated.length) {
            this.showCountdown.set(true);
          }
          this.phraseIndex.set((this.phraseIndex() + 1) % this.headerAnimated.length);
          this.isTyping.set(true);
          this.startTypingEraseLoop();
        }
      }, this.eraseSpeed);
    }
  }

  onCountdownFinished(): void {
    this.countdownFinished.emit();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  onClick(): void {
    this.landingPageClicked.emit(true);
  }

  private clearTimers(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = undefined;
    }

    if (this.erasingTimeout) {
      clearTimeout(this.erasingTimeout);
      this.erasingTimeout = undefined;
    }
  }
}
