import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HuserComponent } from './huser.component';

describe('HuserComponent', () => {
  let component: HuserComponent;
  let fixture: ComponentFixture<HuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HuserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
