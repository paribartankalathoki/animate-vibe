import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    AfterViewChecked,
    ElementRef,
    ViewChild,
    Renderer2,
    signal,
    ChangeDetectorRef,
    NgZone
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {CountdownTimerComponent} from '../countdown-timer/countdown-timer.component';
import {Question} from '../../core/interfaces/question';
import {ChatMessage} from "../../core/interfaces/chat-message";

@Component({
    selector: 'app-chat-demo',
    standalone: true,
    imports: [CommonModule, CountdownTimerComponent],
    templateUrl: './chat-demo.component.html',
    styleUrls: ['./chat-demo.component.scss'],
})
export class ChatDemoComponent implements OnInit, AfterViewChecked {
    countdown: number = 10;
    dashArray: number = 100;
    showCountdown = signal<boolean>(false);
    countdownVisible = false;
    intervalId: any;
    @Input() questions: Question[] = [];
    @Output() countdownFinished = new EventEmitter<void>();
    allMessages: ChatMessage[] = [];
    displayedMessages: ChatMessage[] = [];
    activePairIndex = 0;
    currentTypingMessage: ChatMessage | null = null
    fixedHeightMessages = new Set<string>();
    @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
    private renderer = inject(Renderer2);
    private cdRef = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);
    private router = inject(Router);
    private shouldScrollToBottom = false;

    ngOnInit(): void {
        if (this.questions && this.questions.length) {
            this.prepareAllMessages();

            this.activateUserMessage(0);

            setTimeout(() => this.activateAiMessage(0), 500);
        }
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.smoothScrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    prepareAllMessages(): void {
        this.allMessages = [];

        this.questions.forEach((q, i) => {
            // Create user message
            this.allMessages.push({
                sender: 'user',
                text: q.question,
                id: `msg-${i * 2}`,
                pairIndex: i,
                active: false,
                completed: false
            });

            // Create AI message
            this.allMessages.push({
                sender: 'ai',
                text: q.answer,
                id: `msg-${i * 2 + 1}`,
                pairIndex: i,
                active: false,
                completed: false,
                isTyping: false
            });
        });
    }

    activateUserMessage(pairIndex: number): void {
        if (pairIndex >= this.questions.length) return;

        const msgIndex = pairIndex * 2;
        const userMsg = this.allMessages[msgIndex];

        userMsg.active = true;
        userMsg.completed = true;

        if (!this.displayedMessages.some(m => m.id === userMsg.id)) {
            this.displayedMessages.push(userMsg);
        }

        this.activePairIndex = pairIndex;
        if (pairIndex > 0) {
            this.shouldScrollToBottom = true;
        }
    }

    activateAiMessage(pairIndex: number): void {
        if (pairIndex >= this.questions.length) {
            this.startCountdown();
            return;
        }


        this.renderer.setStyle(
            this.messagesContainer.nativeElement,
            'padding-bottom',
            '540px'
        );

        const msgIndex = pairIndex * 2 + 1;
        const aiMsg = this.allMessages[msgIndex];
        aiMsg.active = true;
        aiMsg.isTyping = true;
        aiMsg.text = '';

        if (!this.displayedMessages.some(m => m.id === aiMsg.id)) {
            this.displayedMessages.push(aiMsg);
        }

        this.currentTypingMessage = aiMsg;

        setTimeout(() => {
            if (pairIndex > 0) {
                setTimeout(() => {
                    const element = this.messagesContainer.nativeElement;
                    const scrollTo = element.scrollHeight - 650;
                    element.scrollTo({
                        top: scrollTo > 0 ? scrollTo : 0,
                        behavior: 'smooth'
                    });
                }, 0);
            }

        }, 0);

        const typingDelay = pairIndex === 0 ? 1000 : 500;

        setTimeout(() => {
            this.fixedHeightMessages.add(aiMsg.id);
            aiMsg.isTyping = false;
            this.typeAiMessage(aiMsg, this.questions[pairIndex].answer, 0, () => {
                aiMsg.completed = true;

                if (pairIndex === 0) {
                    this.renderer.setStyle(this.messagesContainer.nativeElement, 'padding-bottom', '20px');

                    setTimeout(() => {
                        this.smoothScrollToBottom();
                        setTimeout(() => {
                            this.activateUserMessage(pairIndex + 1);

                            setTimeout(() => this.activateAiMessage(pairIndex + 1), 20);
                        }, 100);
                    }, 10);
                } else {
                    setTimeout(() => this.startCountdown(), 1000);
                }
            });
        }, typingDelay);
    }

    typeAiMessage(message: ChatMessage, fullText: string, charIndex: number, callback: () => void): void {
        if (charIndex < fullText.length) {
            this.ngZone.run(() => {
                message.text = fullText.substring(0, charIndex + 1);
                this.cdRef.detectChanges();
            });

            setTimeout(() => {
                this.typeAiMessage(message, fullText, charIndex + 1, callback);
            }, 20);
        } else {
            callback();
        }
    }

    shouldFixHeight(messageId: string): boolean {
        return this.fixedHeightMessages.has(messageId);
    }

    smoothScrollToBottom(): void {
        if (this.messagesContainer) {
            try {
                const element = this.messagesContainer.nativeElement;
                element.scrollTo({
                    top: element.scrollHeight,
                    behavior: 'smooth'
                });
            } catch (err) {
                console.error('Error scrolling to bottom:', err);
            }
        }
    }

    onScroll(): void {
        if (!this.messagesContainer) return;

        const container = this.messagesContainer.nativeElement;

        // 1. Get the top of the first user message
        const firstMsgElement = document.getElementById('msg-0');
        if (firstMsgElement) {
            const containerTop = container.getBoundingClientRect().top;
            const msgTop = firstMsgElement.getBoundingClientRect().top;

            const offsetAbove = container.scrollTop + (msgTop - containerTop);

            // 2. If user scrolls too far up, clamp it back
            if (offsetAbove < 0) {
                container.scrollTop = container.scrollTop - offsetAbove;
            }
        }

        const containerRect = container.getBoundingClientRect();
        const containerTop = containerRect.top;
        const containerBottom = containerRect.bottom;
        const messagesToUpdate = new Set<string>();

        this.displayedMessages.forEach(msg => {
            if (msg.sender === 'ai' && this.fixedHeightMessages.has(msg.id)) {
                const msgElement = document.getElementById(msg.id);
                if (msgElement) {
                    const msgRect = msgElement.getBoundingClientRect();
                    const isVisible = msgRect.bottom > containerTop && msgRect.top < containerBottom;
                    if (!isVisible) {
                        messagesToUpdate.add(msg.id);
                    }
                }
            }
        });

        if (messagesToUpdate.size > 0) {
            messagesToUpdate.forEach(id => this.fixedHeightMessages.delete(id));
            this.cdRef.detectChanges();
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
