import { Component, signal, input, output, effect } from '@angular/core';
import type { Question } from '../../core/interfaces/question';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-active-chat',
  templateUrl: './active-chat.component.html',
  styleUrls: ['./active-chat.component.scss'],
  imports: [CountdownTimerComponent],
  standalone: true,
})
export class ActiveChatComponent {
  public readonly questions = input.required<Question[]>();
  public readonly countdownFinished = output<void>();
  public readonly shownQuestions = signal<Question[]>([]);
  countdown = signal<number>(10);
  showCountdown = signal<boolean>(false);
  private readonly typingSpeed = 30;
  isActive = input<boolean>(false);
  private isAnimating = false;

  constructor() {
    effect(() => {
      if (this.isActive()) {
        this.reset();
        this.revealMessages();
      } else {
        this.isAnimating = false;
        this.showCountdown.set(false);
      }
    });
  }

  reset() {
    this.shownQuestions.set([]);
    this.countdown.set(10);
    this.showCountdown.set(false);
    this.isAnimating = false;
  }

  async revealMessages() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const _questions = this.questions();
    for (const { answer, question } of _questions) {
      if (!this.isActive() || !this.isAnimating) {
        break;
      }

      this.shownQuestions.update(questions => {
        const newQuestions = [...questions];
        newQuestions.push({ question, answer: '' });
        return newQuestions;
      });
      await this.delay(400);

      if (!this.isActive() || !this.isAnimating) {
        break;
      }

      await this.typeAnswer(answer);
      await this.delay(300);
      this.scrollToMessage();
    }

    if (this.isActive() && this.isAnimating) {
      await this.startCountdown();
    }
  }

  async typeAnswer(fullText: string) {
    for (let i = 1; i <= fullText.length; i++) {
      // Check if still active before each typing update
      if (!this.isActive() || !this.isAnimating) {
        break;
      }

      this.shownQuestions.update(questions => {
        const newQuestions = [...questions];
        newQuestions[newQuestions.length - 1].answer = fullText.slice(0, i);
        return newQuestions;
      });
      await this.delay(this.typingSpeed);
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const start = performance.now();
      const check = (now: number) => {
        if (now - start >= ms || !this.isActive() || !this.isAnimating) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });
  }

  scrollToMessage() {
    requestAnimationFrame(() => {
      const els = document.querySelectorAll('.question');
      const lastQuestion = els[els.length - 1];
      if (lastQuestion) {
        lastQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  async startCountdown(): Promise<void> {
    this.showCountdown.set(true);
    for (let i = this.countdown(); i >= 0; i--) {
      // Check if still active before each countdown tick
      if (!this.isActive() || !this.isAnimating) {
        break;
      }

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
