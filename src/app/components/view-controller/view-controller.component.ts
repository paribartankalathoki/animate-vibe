import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {LandingPageComponent} from '../landing-page/landing-page.component';
import {AppDataResponse} from '../../core/interfaces/app-data-response';
import {DataService} from '../../services/data.service';
import {ErrorPopupComponent} from '../error-popup/error-popup.component';
import {AppDataResponseImpl} from '../../core/models/app-data-response-impl';
import {ChatDemoComponent} from '../chat-demo/chat-demo.component';
import {LoadingScreenComponent} from '../loading-screen/loading-screen.component';

type ViewType = 'landing' | 'chat';

@Component({
    selector: 'app-view-controller',
    standalone: true,
    imports: [
        LandingPageComponent,
        ErrorPopupComponent,
        ChatDemoComponent,
        LoadingScreenComponent
    ],
    templateUrl: './view-controller.component.html',
    styleUrls: ['./view-controller.component.scss']
})
export class ViewControllerComponent implements OnInit, OnDestroy {
    data: AppDataResponse = new AppDataResponseImpl();
    activeView = signal<ViewType>('landing');

    isApiLoaded = signal<boolean>(false);
    showSplash = signal<boolean>(true);
    showErrorPopup = signal<boolean>(false);
    errorMessage = signal<string>('');

    private errorTimeoutId: any;
    private minDisplayTimeoutId: any;
    private minDisplayTime = 3000;
    private errorTimeout = 12000;
    private loadStartTime: number = 0;
    private dataService = inject(DataService)

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
        this.activeView.update(currentView =>
            currentView === 'landing' ? 'chat' : 'landing'
        );
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
                this.errorMessage.set("Unable to connect. Please check your connection and try again.");
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
            error: (error) => {
                clearTimeout(this.errorTimeoutId);

                const elapsedTime = Date.now() - this.loadStartTime;

                if (elapsedTime >= this.minDisplayTime) {
                    this.showSplash.set(false);
                    this.errorMessage.set(typeof error === 'string' ? error : "Unable to connect. Please check your connection and try again.");
                    this.showErrorPopup.set(true);
                } else {
                    const remainingTime = this.minDisplayTime - elapsedTime;
                    setTimeout(() => {
                        this.showSplash.set(false);
                        this.errorMessage.set(typeof error === 'string' ? error : "Unable to connect. Please check your connection and try again.");
                        this.showErrorPopup.set(true);
                    }, remainingTime);
                }

                this.isApiLoaded.set(true);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.errorTimeoutId) clearTimeout(this.errorTimeoutId);
        if (this.minDisplayTimeoutId) clearTimeout(this.minDisplayTimeoutId);
    }
}
