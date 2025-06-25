import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityRepositoryComponent } from './activity-repository.component';

describe('ActivityRepositoryComponent', () => {
  let component: ActivityRepositoryComponent;
  let fixture: ComponentFixture<ActivityRepositoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityRepositoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
