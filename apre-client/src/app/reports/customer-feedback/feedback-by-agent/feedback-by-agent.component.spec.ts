import { environment } from './../../../../environments/environment.development';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeedbackByAgentComponent } from './feedback-by-agent.component';
import { tick } from '@angular/core/testing';
import { of, Observable } from 'rxjs';

describe('FeedbackByAgentComponent', () => {
  let component: FeedbackByAgentComponent;
  let fixture: ComponentFixture<FeedbackByAgentComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackByAgentComponent, HttpClientTestingModule]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(FeedbackByAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  //Mock asynchronous call to the API
  it('should fetch feedback from the MongoDB and display it', fakeAsync(() => {
    const mockFeedback =[
      {
        feedbackText: "Excellent service!",
        feedbackType: "Positive",
        feedbackSentiment: "Positive",
        feedbackSource: "Chat",
        rating: 5
      }
    ];

    spyOn(component['httpClient'], 'get').and.returnValue(of(mockFeedback));

    component.getFeedback(1007); //Trigger API call
    tick(); // makes tests synchronous by letting you control when the asynchronous operations complete
    fixture.detectChanges();

    expect(component.customerFeedback.length).toBe(1);
    const tableComponent = fixture.nativeElement.querySelector('app-table');
    expect(tableComponent).toBeTruthy();
  }));

  it('should display a message when no feedback is available', fakeAsync(()=> {
    spyOn(component['httpClient'], 'get').and.returnValue(of([]));

    component.getFeedback(1007);
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.no-feedback').textContent).toContain('No feedback available');
  }));

  it('should display an error message when the API call fails', ()=> {
    component.feedbackForm.setValue({agentId:4820});
    component.onSubmit();

    const req= httpMock.expectOne(`${environment.apiBaseUrl}/reports/customer-feedback/feedback-by-agent?agentId=4820`);
    req.error(new ErrorEvent('Network Error'));

    expect(component.errorMessage).toBe('Failed to fetch data. Please try again later.');
    });
    afterEach(() => {
      httpMock.verify();
  });
});
