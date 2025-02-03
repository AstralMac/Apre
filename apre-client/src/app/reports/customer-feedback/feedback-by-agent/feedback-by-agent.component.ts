import { Component, ChangeDetectorRef } from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { TableComponent } from '../../../shared/table/table.component';
import { CommonModule } from '@angular/common';
import { of, Observable } from 'rxjs';
@Component({
  selector: 'app-feedback-by-agent',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule, CommonModule],
  template: `
    <h1 class="title">Customer Feedback by Agent</h1>
    <div class="content-container">
      <form class="form" [formGroup]= "feedbackForm" (ngSubmit)="onSubmit()">
        <div *ngIf="errorMessage">
          <div class="message message--error">
            {{errorMessage}}
          </div>
        </div>

        <div class="form-group">
          <label class="label" for= "agentId">Agent ID</label>
          <input id="agentId" type="number" class="form-control" formControlName= "agentId"/>
        </div>

        <button type="submit" [disabled]="feedbackForm.invalid">Submit</button>
      </form>

      <div *ngIf="customerFeedback.length === 0" class= "no-feedback">
        <p> No feedback available</p>
      </div>

      <div *ngIf="customerFeedback.length > 0" class= "card chard-card">
        <app-table
        [title]="'Customer Feedback by Agent - Tabular'"
        [data]="customerFeedback"
        [headers]="['Date','Customer', 'Product', 'Feedback Type', 'Feedback Text', 'Feedback Source', 'Rating']"
        [sortableColumns]="['Date', 'Feedback Type','Feedback Source' ,'Rating']"
        [headerBackground]="'secondary'"></app-table>
      </div>
    </div>
  `,
  styles: `
  .content-container{
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .form, .chart-card{
    width: 50%;
    margin: 20px 0;
    padding: 10px;
  }

  app-table{
    padding: 50px;
  }
  `
})
export class FeedbackByAgentComponent {
  customerFeedback: any[] = [];
  errorMessage: string= '';

  constructor(private fb: FormBuilder, private httpClient: HttpClient, private cdr: ChangeDetectorRef){}

  feedbackForm= this.fb.group({
    agentId: new FormControl<number | null> (null, [Validators.required])
  });

  //To handle the submission
  onSubmit(){
    const agentId = this.feedbackForm.value.agentId;
    if(this.feedbackForm.valid && agentId != null){
      this.getFeedback(agentId);
    }else{
      this.errorMessage = 'Please enter a Valid Agent Id';
    }
  }

  //Method to fetch feedback data from the API
  getFeedback(agentId: number | null = null) {
    this.httpClient.get<any[]>(`${environment.apiBaseUrl}/reports/customer-feedback/feedback-by-agent?agentId=${agentId}`).subscribe({
      next: (data) => {
        if(!data || data.length === 0) {
          console.error('No feedback available.');
          this.errorMessage = 'No feedback available.';
          this.customerFeedback = [];
          return;
        }

        //Log data for debugging
        console.log('API response:', data);

        //initialize the array
        this.customerFeedback=[];

        for(let record of data){
          const {customerFeedback}= record;

          for(let feedback of customerFeedback) {
            this.customerFeedback.push ({
              Date: feedback.date ? new Date(feedback.date).toLocaleDateString(): 'N/A',
              Customer: feedback.customer || 'Unknown',
              Product: feedback.product || 'Unknown',
              'Feedback Type': feedback.feedbackType || 'N/A',
              'Feedback Text' :feedback.feedbackText || 'No Text',
              'Feedback Source': feedback.feedbackSource || 'Unknown',
              Rating: feedback.rating ?? 'N/A'
            });
          }
        }

        console.log('Customer Feedback Data:', this.customerFeedback);
        this.cdr.detectChanges();
      },
      error: (err)=> {
        console.error('Error fetching feedback data:', err);
        this.errorMessage = "Failed to fetch data. Please try again later."
      }
    });
  }
}
