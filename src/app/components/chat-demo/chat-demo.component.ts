import {Component, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {NgClass} from '@angular/common';
import {Router} from '@angular/router';
import {CountdownTimerComponent} from '../countdown-timer/countdown-timer.component';
import {Question} from '../../core/interfaces/question';
import {ChatMessage} from '../../core/interfaces/chat-message';

@Component({
    selector: 'app-chat-demo',
    imports: [CountdownTimerComponent, NgClass],
    templateUrl: './chat-demo.component.html',
    styleUrls: ['./chat-demo.component.scss'],
    standalone: true
})
export class ChatDemoComponent implements OnInit {
    countdown = signal(10);
    dashArray = signal(100);
    showCountdown = signal(false);
    countdownVisible = false;
    currentTypingIndex = signal(-1);

    @Input() questions: Question[] = [];
    @Output() countdownFinished = new EventEmitter<void>();

    displayedMessages: ChatMessage[] = [];

    private router = inject(Router);

    ngOnInit(): void {
        if (this.questions && this.questions.length) {
            this.startDisplayingMessages();
        }
    }

    startDisplayingMessages(): void {
        let flatMessages: ChatMessage[] = [];
        this.questions.forEach((q) => {
            flatMessages.push({sender: 'user', text: q.question});
            flatMessages.push({sender: 'ai', text: q.answer});
        });

        const showNextMessage = (index: number) => {
            if (index >= flatMessages.length) {
                this.startCountdown();
                return;
            }

            const message = flatMessages[index];

            if (message.sender === 'user') {
                this.displayedMessages.push({...message});

                this.delaySignal().then(() => {
                    this.forceScrollUp();
                    this.delaySignal().then(() => showNextMessage(index + 1));
                });
            } else {
                this.displayedMessages.push({sender: 'ai', text: '', isTyping: true});
                this.currentTypingIndex.set(this.displayedMessages.length - 1);

                this.delaySignal(1000).then(() => {
                    this.forceScrollUp();
                    this.typeMessage(message.text, 0, () => {
                        this.delaySignal().then(() => {
                            this.forceScrollUp();
                            this.delaySignal().then(() => showNextMessage(index + 1));
                        });
                    });
                });
            }
        };

        showNextMessage(0);
    }

    typeMessage(fullText: string, charIndex: number, callback: () => void): void {
        if (charIndex < fullText.length) {
            this.displayedMessages[this.currentTypingIndex()].text = fullText.substring(0, charIndex + 1);

            if (charIndex === 0) {
                this.displayedMessages[this.currentTypingIndex()].isTyping = false;
            }

            // Delay the next character with a signal-based approach
            this.delaySignal(20).then(() => {
                this.typeMessage(fullText, charIndex + 1, callback);
            });
        } else {
            callback();
        }
    }

    delaySignal(ms: number = 100): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    forceScrollUp(): void {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    startCountdown(): void {
        this.countdownVisible = true;
        this.showCountdown.set(true);

        const intervalSignal = signal(this.countdown());

        const countdownInterval = setInterval(() => {
            if (intervalSignal() > 0) {
                intervalSignal.set(intervalSignal() - 1);
                this.dashArray.set((intervalSignal() / 10) * 100);
            } else {
                clearInterval(countdownInterval);
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
