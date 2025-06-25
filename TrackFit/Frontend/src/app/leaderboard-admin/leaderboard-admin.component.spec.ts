import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardAdminComponent } from './leaderboard-admin.component';

describe('LeaderboardAdminComponent', () => {
  let component: LeaderboardAdminComponent;
  let fixture: ComponentFixture<LeaderboardAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeaderboardAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
