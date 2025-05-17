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
  @Output() countdownFinished = new EventEmitter<void>();
  @Output() landingPageClicked = new EventEmitter<any>();
  typedOutput = signal<string>('');
  showCountdown = signal<boolean>(false);
  private typeSpeed = 150;
  private eraseSpeed = 75;
  private phraseIndex = 0;
  private isTyping = true;
  private totalTypedPhrases = 0;
  private typingTimer: number | undefined;
  private erasingTimer: number | undefined;

  private _headerText = signal<string>('');

  get headerText() {
    return this._headerText();
  }

  @Input() set headerText(value: string) {
    this._headerText.set(value);
  }

  private _headerAnimated = signal<string[]>([]);

  get headerAnimated() {
    return this._headerAnimated();
  }

  @Input() set headerAnimated(value: string[]) {
    this._headerAnimated.set(value);
  }

  private _headerImage = signal<string>('');

  get headerImage() {
    return this._headerImage();
  }

  @Input() set headerImage(value: string) {
    this._headerImage.set(value);
  }

  ngOnInit(): void {
    this.startTypingEraseLoop();
  }

  startTypingEraseLoop(): void {
    this.clearTimers();
    this.typingTimer = window.setInterval(() => {
      const currentPhrase = this.headerAnimated[this.phraseIndex];

      if (this.isTyping) {
        if (this.typedOutput().length < currentPhrase.length) {
          this.typedOutput.set(
            this.typedOutput() + currentPhrase[this.typedOutput().length]
          );
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
