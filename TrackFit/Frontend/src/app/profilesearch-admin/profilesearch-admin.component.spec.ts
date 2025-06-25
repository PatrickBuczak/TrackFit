import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilesearchAdminComponent } from './profilesearch-admin.component';

describe('ProfilesearchAdminComponent', () => {
  let component: ProfilesearchAdminComponent;
  let fixture: ComponentFixture<ProfilesearchAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilesearchAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfilesearchAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
