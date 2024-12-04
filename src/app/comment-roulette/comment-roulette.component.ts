import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { YoutubeService } from '../core/services/youtube.service';
import { Comment } from '../core/interfaces/comment';

@Component({
  selector: 'app-comment-roulette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [YoutubeService],
  templateUrl: './comment-roulette.component.html',
  styleUrls: ['./comment-roulette.component.scss']
})
export class CommentRouletteComponent {
  // Declaration of variables used in the component
  placeHolder: string = 'E.g. https://www.youtube.com/watch?v=UPPAgLBcLrI';
  baseChannelUrl: string = 'https://www.youtube.com/channel';
  baseWatchUrl: string = 'https://www.youtube.com/watch?';
  youtubeVideoUrl: string = '';
  commentResult: Comment | null = null;
  commentCount: number | null = null;
  comments: Comment[] = [];
  displayComment: Comment = {
    text: '',
    author: '',
    channelUrl: '',
    videoUrl: ''
  };
  isRouletteRunning: boolean = false;
  includeReplies: boolean = false;
  filterDuplicates: boolean = false;
  filterByWords: boolean = false;
  filterWords: string = '';

  constructor(private youtubeService: YoutubeService) {}

  /**
   * Extracts the video ID from the provided YouTube URL.
   * @param url The YouTube video URL.
   * @returns The video ID or null if not found.
   */
  private extractVideoId(url: string): string | null {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Fetches all comments for the video given its ID.
   * @param callback Function to execute once the comments are fetched.
   */
  private getAllComments(callback: () => void): void {
    const videoId = this.extractVideoId(this.youtubeVideoUrl);
    if (videoId) {
      this.comments = [];
      this.fetchComments({ videoId, pageToken: '', callback });
    } else {
      this.commentResult = null;
      this.commentCount = 0;
      callback();
    }
  }

  /**
   * Toggles the filter by words option.
   */
  public toggleWordFilter(): void {
    if (!this.filterByWords) {
      this.filterWords = '';
    }
  }

  /**
   * Starts the comment roulette, fetching and displaying a random comment every 100ms for 5 seconds.
   */
  public startRoulette(): void {
    // Reset the comment result to null, indicating no result yet.
    this.commentResult = null;

    // Set the flag to indicate the roulette is running.
    this.isRouletteRunning = true;

    // Fetch all comments for the given video ID.
    this.getAllComments(() => {
      // Set up an interval to update the displayed comment every 100 milliseconds.
      const interval = setInterval(() => {
        // Select a random comment from the comments array to display.
        this.displayComment = this.comments[Math.floor(Math.random() * this.comments.length)];
      }, 100); // The interval is set to 100 milliseconds.

      // Set up a timeout to stop the roulette after 5 seconds.
      setTimeout(() => {
        // Clear the interval to stop updating the displayed comment.
        clearInterval(interval);

        // Set the flag to indicate the roulette is no longer running.
        this.isRouletteRunning = false;

        // Set the final displayed comment as the result.
        this.commentResult = this.displayComment;
      }, 5000); // The timeout is set to 5000 milliseconds (5 seconds).
    });
  }

  /**
   * Makes the request to the YouTube API to fetch the comments of a video,
   * handles pagination if necessary.
   * @param videoId The video ID.
   * @param pageToken Page token for pagination.
   * @param callback Function to execute once the comments are fetched.
   */
  public fetchComments({ videoId, pageToken, callback }: { videoId: string; pageToken: string; callback: () => void; }) {
    // Make an HTTP GET request to the YouTube API using the provided video ID and page token
    this.youtubeService.getComments(videoId, pageToken).subscribe(data => {
      // Extract the comments from the response data. Each item may include a top-level comment and its replies
      let comments = data.items.flatMap((item: any) => [
        {
          text: item.snippet.topLevelComment.snippet.textOriginal,
          author: item.snippet.topLevelComment.snippet.authorDisplayName,
          channelUrl: `${this.baseChannelUrl}/${item.snippet.topLevelComment.snippet.authorChannelId.value}`,
          videoUrl: `${this.baseWatchUrl}v=${videoId}&lc=${item.snippet.topLevelComment.id}`
        },
        // Include replies to comments if includeReplies is true
        ...(this.includeReplies ? (item.replies?.comments?.map((reply: any) => ({
          text: reply.snippet.textOriginal,
          author: reply.snippet.authorDisplayName,
          channelUrl: `${this.baseChannelUrl}/${reply.snippet.authorChannelId.value}`,
          videoUrl: `${this.baseWatchUrl}v=${videoId}&lc=${reply.id}`
        })) || []) : [])
      ]);

      // Filter out duplicate comments by users if filterDuplicates is true
      if (this.filterDuplicates) {
        const uniqueUsers = new Set();
        comments = comments.filter((comment: Comment) => {
          if (uniqueUsers.has(comment.author)) {
            return false;
          }
          uniqueUsers.add(comment.author);
          return true;
        });
      }

      // Filter comments by keywords if filterByWords and filterWords are true
      if (this.filterByWords && this.filterWords) {
        const keywords = this.filterWords.split(',').map(word => word.trim().toLowerCase());
        comments = comments.filter((comment: Comment) => {
          const text = comment.text.toLowerCase();
          return keywords.some(keyword => text.includes(keyword));
        });
      }

      // Add the fetched comments to the current comments array
      this.comments.push(...comments);

      // If there is a next page token, fetch the next page of comments recursively
      if (data.nextPageToken) {
        this.fetchComments({ videoId, pageToken: data.nextPageToken, callback });
      } else {
        // If no more pages, execute the callback function
        callback();
      }
    });
  }
}
