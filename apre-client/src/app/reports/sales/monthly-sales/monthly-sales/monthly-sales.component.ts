import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from './../../../../../environments/environment';
import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../../../../shared/table/table.component';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-monthly-sales',
  standalone: true,
  imports: [TableComponent, ReactiveFormsModule, CommonModule],
  providers: [DatePipe],
  template: `
    <h1>Sales by Month - Tabular</h1>
    <div class= "monthlySales-container">
      <form class="form" [formGroup]="monthForm" (ngSubmit)="onSubmit()">

        @if (errorMessage){
          <div class="message message--error">{{errorMessage}}</div>
        }

        <div class="form-group">
          <label class="label" for="month">Month</label>
          <select class="select" formControlName="month" id="month" name="month">
            @for(month of months; track month) {
              <option value="{{month.value}}">{{month.name}}</option>
            }
          </select>
        </div>
        <div class="form_actions">
          <button class="button button--primary" type="submit" title="Click to fetch data" [disabled]= "monthForm.invalid">Submit</button>
        </div>
      </form>

      @if (salesData.length > 0){
        <div class="card chart-card">
          <app-table
            [title] ="'Sales by Month - Tabular'"
            [data]="salesData"
            [headers]="['Date', 'Region','Sales Person','Total Sales']"
            [sortableColumns]="['Date','Sales Person','Region','Total Sales']"
            [headerBackground]="'secondary'"></app-table>
        </div>
      }
    </div>
  `,
  styles: `
    .monthlysales-container{
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .form. ,.chart-card{
      width: 50%;
      margin: 20px 0;
      padding: 10px;
    }

    app-table{
      padding: 50px;
    }
  `
})
export class MonthlySalesComponent {
  salesData: any[] = [];
  months: any[] = [];
  errorMessage: string;

  monthForm = this.fb.group({
    month: [null, Validators.compose([Validators.required])]
  });

  constructor(private http: HttpClient, private fb: FormBuilder, private cdr: ChangeDetectorRef, private datePipe: DatePipe){
    this.months = this.loadMonths();
    this.errorMessage = ''
  }

  loadMonths(){
    return[
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ]
  }

  onSubmit(){
    if(this.monthForm.invalid){
      this.errorMessage = 'Month is required';
    }

    const month = this.monthForm.controls['month'].value;
    this.http.get(`${environment.apiBaseUrl}/reports/sales/monthly-sales?month=${month}`).subscribe({
      next: (data: any) => {
        if (data.length === 0){
          const selectedMonth = this.months.find(m => m.value === Number(month));
          console.error('No data found for', selectedMonth.name);
          this.errorMessage = `No data found for ${selectedMonth.name}`
          return;
        }

        //log the data to check its structure
        console.log('API Response:',data);

       this.salesData = [];
        for (let record of data){
          const salesRecords =record.salesData
          for (let salesRecord of salesRecords){
            const flattenedRecord ={
            Date: this.datePipe.transform(salesRecord.date, 'MM/dd/yyyy'),
            Region: salesRecord.region,
            'Sales Person': salesRecord.salesperson,
            'Total Sales': record.totalSales
          };
          this.salesData.push(flattenedRecord);
        }
          /*record ['Month'] = month;
          record ['Region']= record['region'];
          record ['Sales Person'] = record ['salesperson'];
          record ['Total Sales'] = record ['totalSales']

          //Format the date field
          record['Date'] = this.datePipe.transform(record['date'], 'MM/dd/yyyy');*/
        }

        console.log('Sales data:', this.salesData);

        this.cdr.markForCheck();
        this.cdr.detectChanges();

        this.errorMessage = ''
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }
}
