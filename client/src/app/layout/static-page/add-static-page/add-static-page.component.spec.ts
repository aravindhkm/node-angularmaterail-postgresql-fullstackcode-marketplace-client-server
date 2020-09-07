import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStaticPageComponent } from './add-static-page.component';

describe('AddStaticPageComponent', () => {
  let component: AddStaticPageComponent;
  let fixture: ComponentFixture<AddStaticPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStaticPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStaticPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
