import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationheaderComponent } from './navigationheader.component';

describe('NavigationheaderComponent', () => {
  let component: NavigationheaderComponent;
  let fixture: ComponentFixture<NavigationheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationheaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
