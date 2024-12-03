import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  private apiKey: string = environment.apiKey;

  constructor(private http: HttpClient) {}

  getVideoComments(videoId: string): Observable<any> {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${this.apiKey}`;
    return this.http.get<any>(url);
  }

  getVideoDetails(videoId: string): Observable<any> {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${this.apiKey}`;
    return this.http.get<any>(url);
  }
}
