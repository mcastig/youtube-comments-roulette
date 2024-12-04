
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentRouletteComponent } from './comment-roulette.component';
import { YoutubeService } from '../core/services/youtube.service';
import { Comment } from '../core/interfaces/comment';
import { of } from 'rxjs';

describe('CommentRouletteComponent', () => {
  let component: CommentRouletteComponent;
  let fixture: ComponentFixture<CommentRouletteComponent>;
  let youtubeService: jasmine.SpyObj<YoutubeService>;

  beforeEach(async () => {
    const youtubeServiceSpy = jasmine.createSpyObj('YoutubeService', ['getComments']);

    await TestBed.configureTestingModule({
      declarations: [CommentRouletteComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: YoutubeService, useValue: youtubeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentRouletteComponent);
    component = fixture.componentInstance;
    youtubeService = TestBed.inject(YoutubeService) as jasmine.SpyObj<YoutubeService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start roulette and display a random comment', fakeAsync(() => {
    const mockComments: Comment[] = [
      { text: 'Comment 1', author: 'User 1', channelUrl: '', videoUrl: '' },
      { text: 'Comment 2', author: 'User 2', channelUrl: '', videoUrl: '' },
      { text: 'Comment 3', author: 'User 3', channelUrl: '', videoUrl: '' }
    ];
    youtubeService.getComments.and.returnValue(of({ items: mockComments, nextPageToken: null }));

    spyOn(component as any, 'getAllComments').and.callFake((callback: () => void) => {
      component.comments = mockComments;
      callback();
    });

    component.startRoulette();

    expect(component.commentResult).toBeNull();
    expect(component.isRouletteRunning).toBeTrue();

    tick(100); // Simulate 100ms passing
    expect(component.displayComment).not.toBeNull();
    expect(mockComments).toContain(component.displayComment);

    tick(5000); // Simulate 5000ms passing
    expect(component.isRouletteRunning).toBeFalse();
    expect(component.commentResult).toEqual(component.displayComment);
  }));

  it('should stop roulette and set the final comment result after 5 seconds', fakeAsync(() => {
    const mockComments: Comment[] = [
      { text: 'Comment 1', author: 'User 1', channelUrl: '', videoUrl: '' },
      { text: 'Comment 2', author: 'User 2', channelUrl: '', videoUrl: '' }
    ];
    youtubeService.getComments.and.returnValue(of({ items: mockComments, nextPageToken: null }));

    spyOn(component as any, 'getAllComments').and.callFake((callback: () => void) => {
      component.comments = mockComments;
      callback();
    });

    component.startRoulette();
    tick(5100); // Simulate more than 5 seconds passing

    expect(component.isRouletteRunning).toBeFalse();
    expect(component.commentResult).not.toBeNull();
    expect(mockComments).toContain(component.commentResult!);
  }));
});
