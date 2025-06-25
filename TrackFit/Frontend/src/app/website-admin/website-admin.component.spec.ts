import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteAdminComponent } from './website-admin.component';

describe('WebsiteAdminComponent', () => {
  let component: WebsiteAdminComponent;
  let fixture: ComponentFixture<WebsiteAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WebsiteAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
