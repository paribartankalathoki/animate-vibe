import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  signal,
} from '@angular/core';
import {Question} from '../../core/interfaces/question';
import {CountdownTimerComponent} from '../countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-active-chat',
  templateUrl: './active-chat.component.html',
  styleUrls: ['./active-chat.component.scss'],
  imports: [CountdownTimerComponent],
  standalone: true
})
export class ActiveChatComponent implements OnInit {
  @Output() countdownFinished = new EventEmitter<void>();

  countdown = signal<number>(10);
  showCountdown = signal<boolean>(false);
  visibleMessages = signal<number[]>([]);
  currentTypedAnswers = signal<string[]>([]);
  typingSpeed = 30;

  private _questions = signal<Question[]>([]);

  get questions() {
    return this._questions();
  }

  @Input() set questions(value: Question[]) {
    this._questions.set(value);
  }

  ngOnInit(): void {
    this.revealMessages();
  }

  async revealMessages() {
    const questions = this.questions;

    for (let i = 0; i < questions.length; i++) {
      this.visibleMessages.update(messages => [...messages, i]);

      this.currentTypedAnswers.update(answers => {
        const newAnswers = [...answers];
        newAnswers[i] = '';
        return newAnswers;
      });

      await this.delay(400);
      await this.typeAnswer(i, questions[i].answer);
      await this.delay(300);

      const nextId = `user-${i + 1}`;
      this.scrollToMessage(nextId);
    }

    await this.startCountdown();
  }

  async typeAnswer(index: number, fullText: string) {
    for (let i = 1; i <= fullText.length; i++) {
      this.currentTypedAnswers.update(answers => {
        const newAnswers = [...answers];
        newAnswers[index] = fullText.slice(0, i);
        return newAnswers;
      });

      await this.delay(this.typingSpeed);
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const start = performance.now();
      const check = (now: number) => {
        if (now - start >= ms) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });
  }

  isVisible(index: number): boolean {
    return this.visibleMessages().includes(index);
  }

  scrollToMessage(id: string) {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  }

  async startCountdown(): Promise<void> {
    this.showCountdown.set(true);
    for (let i = this.countdown(); i >= 0; i--) {
      this.countdown.set(i);
      if (i === 0) {
        this.countdownFinished.emit();
        break;
      }
      await this.delay(1000);
    }
  }

  onCountdownFinished(): void {
    this.countdownFinished.emit();
  }
}
