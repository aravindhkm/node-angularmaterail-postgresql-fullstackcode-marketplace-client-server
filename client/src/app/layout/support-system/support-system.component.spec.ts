import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportSystemComponent } from './support-system.component';

describe('SupportSystemComponent', () => {
  let component: SupportSystemComponent;
  let fixture: ComponentFixture<SupportSystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportSystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
