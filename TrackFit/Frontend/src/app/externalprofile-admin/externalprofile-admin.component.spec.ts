import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalprofileAdminComponent } from './externalprofile-admin.component';

describe('ExternalprofileAdminComponent', () => {
  let component: ExternalprofileAdminComponent;
  let fixture: ComponentFixture<ExternalprofileAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalprofileAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExternalprofileAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
