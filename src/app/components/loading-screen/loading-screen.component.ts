import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  imports: [],
  template: `
    <div class="bg-gradient">
      <div
        class="container mx-auto min-h-screen overflow-x-hidden text-yellow-300 flex flex-col items-center justify-center">
        <div class="w-40 h-40 flex items-center justify-center mb-4 mt-6">
          <img src="loading-screen-image.jpg" alt="img" />
        </div>

        <h1 class="text-2xl font-bold mb-2">Piyush AI</h1>

        <p class="text-sm mb-16">Hello buddy. I am here to assist you.</p>

        <div class="absolute bottom-14">
          <div class="spinner"></div>
        </div>

        <div class="absolute bottom-4 text-[9px] opacity-70">
          CAPA is an AI Assistant Powered by Bseen.ai
        </div>
      </div>
    </div>
  `,
  standalone: true,
  styles: [
    `
      .bg-gradient {
        background: linear-gradient(
          180deg,
          #ff004c 0%,
          color-mix(in srgb, #ff004c 80%, black) 100%
        );
      }

      .spinner {
        width: 50px;
        aspect-ratio: 1;
        display: grid;
        -webkit-mask: conic-gradient(from 22deg, #0003, #000);
        mask: conic-gradient(from 22deg, #0003, #000);
        animation: spin 0.75s steps(8) infinite;
      }

      .spinner,
      .spinner:before {
        --gradient: linear-gradient(#facc15 0 0) 50%;
        background:
          var(--gradient) / 34% 6% space no-repeat,
          var(--gradient) / 6% 34% no-repeat space;
      }

      .spinner:before {
        content: '';
        transform: rotate(45deg);
      }

      @keyframes spin {
        from {
          transform: rotate(0turn);
        }

        to {
          transform: rotate(1turn);
        }
      }
    `,
  ],
})
export class LoadingScreenComponent {}
