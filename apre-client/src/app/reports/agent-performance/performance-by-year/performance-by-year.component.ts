import { Component, ChangeDetectorRef } from '@angular/core';
import { Form, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../../../shared/table/table.component';
import { CommonModule, DatePipe } from '@angular/common';

interface PerformanceItem {
  date: string;
  agentId: string;
  region: string;
  team: string;
  metrics: { metricType: string; value: any }[];
  averageResolutionTime: string;
}


@Component({
  selector: 'app-performance-by-year',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule, CommonModule],
  providers: [DatePipe],
  template: `
    <h1>Agent Performance by Year</h1>
    <div class="apby-container">
      <form class="form" [formGroup]="yearForm" (ngSubmit)="onSubmit()">

     <div *ngIf="errorMessage">
        <div class="message message--error">
          {{errorMessage}}
        </div>
      </div>

      <div class="form-group">
        <label class="label" for="year">Year</label>
        <select class="select" formControlName="year" id="year" name="year">
          <option *ngFor="let year of years" [value]="year.value">{{year.name}}</option>
        </select>

      </div>
        <div class="form_actions">
          <button class="button button--primary" type= "submit" title="Click to fetch data" [disabled]= "yearForm.invalid">Submit</button>
        </div>
      </form>

      <div *ngIf="metrics.length > 0" class="card chart-card">
        <app-table
          [title]="'Agent Performance by Year - Tabular'"
          [data]="metrics"
          [headers]="['Agent ID', 'Region', 'Team', 'Call Duration', 'Resolution Time']"
          [sortableColumns]="['Agent ID', 'Region', 'Team']"
          [headerBackground]="'secondary'">
        </app-table>
      </div>
    </div>
  `,
  styles: `
  .apby-container{
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
export class PerformanceByYearComponent {
  metrics: any[] = [];
  years: any[] = [];
  errorMessage: string;

  yearForm = this.fb.group({
    year: [ null as number | null, Validators.compose([Validators.required])]
  });

  constructor(private http: HttpClient, private fb: FormBuilder, private cdr:ChangeDetectorRef, private datePipe: DatePipe){
    this.years = this.loadYears();
    this.errorMessage = ''
  }

  loadYears(){
    return[
      {value: 2020, name: 'Year 2020'},
      {value: 2021, name: 'Year 2021'},
      {value: 2022, name: 'Year 2022'},
      {value: 2023, name: 'Year 2023'},
      {value: 2024, name: 'Year 2024'},
      {value: 2025, name: 'Year 2025'}
    ]
  }

  onSubmit() {
  if (this.yearForm.invalid) {
    this.errorMessage = 'Year is required';
    return;
  }

  const year = this.yearForm.controls['year'].value;

  // Handle the API request
  this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/performance-by-year?year=${year}`).subscribe({
    next: (data: any) => {
      if (data.length === 0) {
        const selectedYear = this.years.find(y => y.value === Number(year));
        console.error('No data found for', selectedYear.name);
        this.errorMessage = `No data found for ${selectedYear.name}`;
        return;
      }

      // Log the data for debugging
      console.log('API Response:', data);

      // Map the data to match the table headers
      this.metrics = [];
      for (let record of data) {
        // Extract the common fields
        const { agentId, region, team, totalCallDuration, averageResolutionTime, metrics } = record;

        // For each record, loop through the performance metrics
        for (let metricsRecord of metrics) {
          const flattenedRecord = {
            Date: this.datePipe.transform(record.date, 'yyyy-MM-dd'),
            'Agent ID': agentId,
            Region: region,
            Team: team,
            'Call Duration': totalCallDuration || 'N/A', // Use totalCallDuration from the record
            'Resolution Time': averageResolutionTime || 'N/A', // Use averageResolutionTime from the record
          };
          this.metrics.push(flattenedRecord);
        }
      }

      console.log('Metric data:', this.metrics);

      // Trigger change detection manually to ensure the UI updates
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error fetching data:', err);
      this.errorMessage = "Failed to fetch data. Please try again later.";
    }
  });
}

}
