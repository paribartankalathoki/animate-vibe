import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'animate-vibe';

  isAppLoaded = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.isAppLoaded = true;
    }, 7000);
  }

  ngOnDestroy(): void {
  }

}
