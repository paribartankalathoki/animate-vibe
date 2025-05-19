import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { LandingPageComponent } from '../landing-page/landing-page.component';
import { AppDataResponse } from '../../core/interfaces/app-data-response';
import { DataService } from '../../services/data.service';
import { ErrorPopupComponent } from '../error-popup/error-popup.component';
import { AppDataResponseImpl } from '../../core/models/app-data-response-impl';
import { LoadingScreenComponent } from '../loading-screen/loading-screen.component';
import { ActiveChatComponent } from '../active-chat/active-chat.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-controller',
  imports: [
    CommonModule,
    LandingPageComponent,
    ErrorPopupComponent,
    LoadingScreenComponent,
    ActiveChatComponent,
  ],
  templateUrl: './view-controller.component.html',
  styleUrls: ['./view-controller.component.scss'],
  standalone: true,
})
export class ViewControllerComponent implements OnInit, OnDestroy {
  data: AppDataResponse = new AppDataResponseImpl();
  activeView = signal<'landing' | 'chat'>('landing');
  isApiLoaded = signal<boolean>(false);
  isAnimated = signal<boolean>(false);
  showSplash = signal<boolean>(true);
  showErrorPopup = signal<boolean>(false);
  errorMessage = signal<string>('');

  private errorTimeoutId: any;
  private minDisplayTimeoutId: any;
  private minDisplayTime = 3000;
  private errorTimeout = 12000;
  private loadStartTime: number = 0;
  private dataService = inject(DataService);
  private isTransitioning = false;

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
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.isAnimated.set(true);

    setTimeout(() => {
      this.activeView.update(currentView => (currentView === 'landing' ? 'chat' : 'landing'));
      this.isTransitioning = false;
    }, 100);
  }

  isLandingPageClicked() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.isAnimated.set(true);

    setTimeout(() => {
      this.activeView.update(() => 'chat');
      this.isTransitioning = false;
    }, 100);
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
      next: (data: AppDataResponse) => {
        clearTimeout(this.errorTimeoutId);
        this.data = data;
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
