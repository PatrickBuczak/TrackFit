import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsListAdminComponent } from './friends-list-admin.component';

describe('FriendsListAdminComponent', () => {
  let component: FriendsListAdminComponent;
  let fixture: ComponentFixture<FriendsListAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsListAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FriendsListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
