import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { LandingPageComponent } from '../landing-page/landing-page.component';
import { AppDataResponse } from '../../core/interfaces/app-data-response';
import { DataService } from '../../services/data.service';
import { ErrorPopupComponent } from '../error-popup/error-popup.component';
import { AppDataResponseImpl } from '../../core/models/app-data-response-impl';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';
import { ActiveChatComponent } from '../active-chat/active-chat.component';
import {animate, style, transition, trigger} from '@angular/animations';

type ViewType = 'landing' | 'chat';

@Component({
  selector: 'app-view-controller',
  imports: [LandingPageComponent, ErrorPopupComponent, LoadingScreenComponent, ActiveChatComponent],
  templateUrl: './view-controller.component.html',
  styleUrls: ['./view-controller.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition('void => in', [
        style({ transform: 'translateX(100%)', position: 'absolute', width: '100%' }),
        animate('400ms ease-out', style({ transform: 'translateX(0%)' })),
      ]),
      transition('in => void', [
        style({ transform: 'translateX(0%)', position: 'absolute', width: '100%' }),
        animate('400ms ease-in', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],
  standalone: true
})
export class ViewControllerComponent implements OnInit, OnDestroy {
  public readonly data = signal<AppDataResponse>(new AppDataResponseImpl());
  public readonly activeView = signal<ViewType>('landing');

  isApiLoaded = signal<boolean>(false);
  showSplash = signal<boolean>(true);
  showErrorPopup = signal<boolean>(false);
  errorMessage = signal<string>('');

  private errorTimeoutId?: ReturnType<typeof setTimeout>;
  private minDisplayTimeoutId?: ReturnType<typeof setTimeout>;
  private minDisplayTime = 3000;
  private errorTimeout = 12000;
  private loadStartTime = 0;
  private dataService = inject(DataService);

  ngOnInit(): void {
    this.loadStartTime = Date.now();
    this.getAppDataDetails();

    this.minDisplayTimeoutId = setTimeout(() => {
      if (this.isApiLoaded()) {
        this.showSplash.set(false);
      }
    }, this.minDisplayTime);
  }

  switchView(): void {
    this.activeView.update(currentView => (currentView === 'landing' ? 'chat' : 'landing'));
  }

  isLandingPageClicked() {
    this.activeView.update(() => 'chat');
  }

  getAppDataDetails(): void {
    this.showSplash.set(true);
    this.showErrorPopup.set(false);
    this.isApiLoaded.set(false);

    this.loadStartTime = Date.now();

    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
    if (this.minDisplayTimeoutId) clearTimeout(this.minDisplayTimeoutId);

    this.minDisplayTimeoutId = setTimeout(() => {
      if (this.isApiLoaded()) {
        this.showSplash.set(false);
      }
    }, this.minDisplayTime);

    this.errorTimeoutId = setTimeout(() => {
      if (!this.isApiLoaded()) {
        this.showSplash.set(false);
        this.errorMessage.set('Unable to connect. Please check your connection and try again.');
        this.showErrorPopup.set(true);
      }
    }, this.errorTimeout);

    this.dataService.getAppDataDetails().subscribe({
      next: data => {
        clearTimeout(this.errorTimeoutId);
        this.data.set(data);
        this.isApiLoaded.set(true);

        const elapsedTime = Date.now() - this.loadStartTime;
        if (elapsedTime >= this.minDisplayTime) {
          this.showSplash.set(false);
        }
      },
      error: error => {
        clearTimeout(this.errorTimeoutId);

        const elapsedTime = Date.now() - this.loadStartTime;

        if (elapsedTime >= this.minDisplayTime) {
          this.showSplash.set(false);
          this.errorMessage.set(
            typeof error === 'string'
              ? error
              : 'Unable to connect. Please check your connection and try again.'
          );
          this.showErrorPopup.set(true);
        } else {
          const remainingTime = this.minDisplayTime - elapsedTime;
          setTimeout(() => {
            this.showSplash.set(false);
            this.errorMessage.set(
              typeof error === 'string'
                ? error
                : 'Unable to connect. Please check your connection and try again.'
            );
            this.showErrorPopup.set(true);
          }, remainingTime);
        }

        this.isApiLoaded.set(true);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
    if (this.minDisplayTimeoutId) clearTimeout(this.minDisplayTimeoutId);
  }
}
