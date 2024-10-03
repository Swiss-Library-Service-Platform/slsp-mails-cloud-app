import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndeliverableOverviewComponent } from './undeliverable-overview.component';

describe('UndeliverableOverviewComponent', () => {
  let component: UndeliverableOverviewComponent;
  let fixture: ComponentFixture<UndeliverableOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UndeliverableOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UndeliverableOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
