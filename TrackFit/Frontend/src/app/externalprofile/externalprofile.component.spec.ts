import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalprofileComponent } from './externalprofile.component';

describe('ExternalprofileComponent', () => {
  let component: ExternalprofileComponent;
  let fixture: ComponentFixture<ExternalprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalprofileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExternalprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
