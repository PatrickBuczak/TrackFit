import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialfeedAdminComponent } from './socialfeed-admin.component';

describe('SocialfeedAdminComponent', () => {
  let component: SocialfeedAdminComponent;
  let fixture: ComponentFixture<SocialfeedAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialfeedAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SocialfeedAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
