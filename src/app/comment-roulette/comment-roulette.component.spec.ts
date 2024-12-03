import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentRouletteComponent } from './comment-roulette.component';

describe('CommentRouletteComponent', () => {
  let component: CommentRouletteComponent;
  let fixture: ComponentFixture<CommentRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
