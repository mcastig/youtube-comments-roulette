import { Component } from '@angular/core';
import { CommentRouletteComponent } from "./comment-roulette/comment-roulette.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommentRouletteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'youtube-comments-roulette';
}
