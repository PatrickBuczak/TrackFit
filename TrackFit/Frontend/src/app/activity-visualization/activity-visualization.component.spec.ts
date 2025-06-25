import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityVisualizationComponent } from './activity-visualization.component';

describe('ActivityVisualizationComponent', () => {
  let component: ActivityVisualizationComponent;
  let fixture: ComponentFixture<ActivityVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
