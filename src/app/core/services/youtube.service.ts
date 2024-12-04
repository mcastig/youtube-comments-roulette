import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  private apiUrl = 'https://www.googleapis.com/youtube/v3';
  private apiKey: string = environment.apiKey; // Usa la clave de API desde environment

  constructor(private http: HttpClient) {}

  getComments(videoId: string, pageToken: string = ''): Observable<any> {
    const url = `${this.apiUrl}/commentThreads?part=snippet,replies&videoId=${videoId}&key=${this.apiKey}&pageToken=${pageToken}&maxResults=100`;
    return this.http.get<any>(url);
  }
}
