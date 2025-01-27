import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment.development';
import { PerformanceByYearComponent } from './performance-by-year.component';

describe('PerformanceByYearComponent', () => {
  let component: PerformanceByYearComponent;
  let fixture: ComponentFixture<PerformanceByYearComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceByYearComponent, HttpClientTestingModule]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(PerformanceByYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title "Agent Performance by Year" ', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Agent Performance by Year');
  });

  it('should intialize the yearForm with a null value', () => {
    const yearControl = component.yearForm.controls['year'];
    expect(yearControl.value).toBeNull();
    expect(yearControl.valid).toBeFalse();
  });

  it('should not submit the form if a year has not been selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form_actions button');

    //Disable the submit until parameter is selected
    expect(submitButton.disabled).toBeTrue();

    //Attempt to "click" button
    submitButton.click();

    expect(component.onSubmit).not.toHaveBeenCalled();
    expect(component.yearForm.valid).toBeFalse();
  });

  it('should load the list of years correctly', () =>{
    expect(component.years).toEqual([
 { value: 2020, name: 'Year 2020' },
    { value: 2021, name: 'Year 2021' },
    { value: 2022, name: 'Year 2022' },
    { value: 2023, name: 'Year 2023' },
    { value: 2024, name: 'Year 2024' },
    { value: 2025, name: 'Year 2025' }
    ]);
  });

   it('should call the API with the selected year on form submission', () => {
    // Set the form value
    component.yearForm.setValue({ year: 2023 });

    // Trigger the form submission
    component.onSubmit();

    // Expect an HTTP GET request to the correct URL
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/agent-performance/performance-by-year?year=2023`);
    expect(req.request.method).toBe('GET');
    req.flush([
          {
        _id: 2023,
        agentId: 1001,
        region: "Europe",
        team: "TeleSales Titans",
        metrics: [
          {metricType: "Customer Satisfaction", value: 90},
          {metricType: "Sales Conversion", value: 80}
        ],
        totalCallDuration: 500,
        averageResolutionTime: 100
      }
    ]);

    // Verify that there were no errors
    expect(component.errorMessage).toBe('');
  });

  it('should display an error message when the API call fails', () => {
  component.yearForm.setValue({ year: 2023 });
  component.onSubmit();

  const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/agent-performance/performance-by-year?year=2023`);
  req.error(new ErrorEvent('Network error'));

  expect(component.errorMessage).toBe('Failed to fetch data. Please try again later.');
});

  afterEach(() => {
    httpMock.verify();
  });
});
