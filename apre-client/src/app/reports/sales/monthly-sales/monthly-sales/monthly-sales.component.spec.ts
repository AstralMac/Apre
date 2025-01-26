import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthlySalesComponent } from './monthly-sales.component';

describe('MonthlySalesComponent', () => {
  let component: MonthlySalesComponent;
  let fixture: ComponentFixture<MonthlySalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      //Import HTTP testing module and the monthly sales component
      imports: [HttpClientTestingModule ,MonthlySalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlySalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title "Sales by Month - Tabular" ', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Sales by Month - Tabular');
  });

  it('should intialize the monthForm with a null value', () => {
    const monthControl= component.monthForm.controls['month'];
    expect(monthControl.value).toBeNull();
    expect(monthControl.valid).toBeFalse();
  });

  it('should not submit the form is a month is not selected',() => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form_actions button');

    // assert that the button is disabled intially
    expect(submitButton.disabled).toBeTrue();

    //Attempt to click button
    submitButton.click();

    expect(component.onSubmit).not.toHaveBeenCalled();
    expect(component.monthForm.valid).toBeFalse();
  });
});
