import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  isAppLoaded = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.isAppLoaded = true;
    }, 7000);
  }
}
