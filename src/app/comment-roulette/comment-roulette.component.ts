import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { YoutubeService } from '../core/services/youtube.service';

@Component({
  selector: 'app-comment-roulette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [YoutubeService],
  templateUrl: './comment-roulette.component.html',
  styleUrl: './comment-roulette.component.scss'
})
export class CommentRouletteComponent {
  placeholder: string = 'E.g. https://www.youtube.com/watch?v=UPPAgLBcLrI';
  youtubeVideoUrl: string = '';
  videoId: string = '';
  videoIdCode: string = '';
  commentResult: string = '';
  commentCount: number | null = null;

  constructor(private youtubeService: YoutubeService) {}


  private extractVideoId(url: string): string {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  public getRandomComment() {
    const videoId = this.extractVideoId(this.youtubeVideoUrl);
    if (videoId) {
      this.videoIdCode = videoId;
      this.youtubeService.getVideoComments(videoId).subscribe(data => {
        const comments = data.items.map((item: {
          snippet: {
            topLevelComment: { snippet: { textOriginal: any; };
          };
        };
      }) => item.snippet.topLevelComment.snippet.textOriginal);
      this.commentResult = comments[Math.floor(Math.random() * comments.length)];
      });

      this.youtubeService.getVideoDetails(videoId).subscribe(data => {
        this.commentCount = data.items[0].statistics.commentCount;
      });
    } else {
      this.commentResult = '';
      this.commentCount = null;
    }
  }
}

