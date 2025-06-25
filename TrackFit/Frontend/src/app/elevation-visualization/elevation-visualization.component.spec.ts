import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElevationVisualizationComponent } from './elevation-visualization.component';

describe('ElevationVisualizationComponent', () => {
  let component: ElevationVisualizationComponent;
  let fixture: ComponentFixture<ElevationVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElevationVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ElevationVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
