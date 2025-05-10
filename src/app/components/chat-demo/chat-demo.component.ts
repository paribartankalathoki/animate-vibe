import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CountdownTimerComponent } from '../countdown-timer/countdown-timer.component';
import {Question} from '../../core/interfaces/question';
import {ChatMessage} from '../../core/interfaces/chat-message';

@Component({
  selector: 'app-chat-demo',
  imports: [CommonModule, CountdownTimerComponent],
  templateUrl: './chat-demo.component.html',
  standalone: true,
  styleUrls: ['./chat-demo.component.scss']
})
export class ChatDemoComponent implements OnInit {
  countdown: number = 10;
  dashArray: number = 100;

  showCountdown = signal<boolean>(false);
  countdownVisible = false;
  intervalId: any;

  @Input() questions: Question[] = [];
  @Output() countdownFinished = new EventEmitter<void>();

  displayedMessages: ChatMessage[] = [];
  currentTypingIndex: number = -1;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (this.questions && this.questions.length) {
      this.startDisplayingMessages();
    }
  }

  startDisplayingMessages(): void {
    let flatMessages: ChatMessage[] = [];
    this.questions.forEach((q) => {
      flatMessages.push({ sender: 'user', text: q.question });
      flatMessages.push({ sender: 'ai', text: q.answer });
    });

    const showNextMessage = (index: number) => {
      if (index >= flatMessages.length) {
        this.startCountdown();
        return;
      }

      const message = flatMessages[index];

      if (message.sender === 'user') {
        this.displayedMessages.push({ ...message });
        setTimeout(() => showNextMessage(index + 1), 800);
      } else {
        this.displayedMessages.push({ sender: 'ai', text: '', isTyping: true });
        this.currentTypingIndex = this.displayedMessages.length - 1;

        setTimeout(() => {
          this.typeMessage(message.text, 0, () => {
            setTimeout(() => showNextMessage(index + 1), 1000);
          });
        }, 1000);
      }
    };

    showNextMessage(0);
  }

  typeMessage(fullText: string, charIndex: number, callback: () => void): void {
    if (charIndex < fullText.length) {
      this.displayedMessages[this.currentTypingIndex].text = fullText.substring(0, charIndex + 1);

      if (charIndex === 0) {
        this.displayedMessages[this.currentTypingIndex].isTyping = false;
      }

      setTimeout(() => {
        this.typeMessage(fullText, charIndex + 1, callback);
      }, 20);
    } else {
      callback();
    }
  }

  startCountdown(): void {
    this.countdownVisible = true;
    this.showCountdown.set(true);
    this.intervalId = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.dashArray = (this.countdown / 10) * 100;
      } else {
        clearInterval(this.intervalId);
        this.countdownFinished.emit();
      }
    }, 1000);
  }

  onClick(): void {
    this.router.navigate(['/chat']);
  }

  onCountdownFinished(): void {
    this.countdownFinished.emit();
  }
}
