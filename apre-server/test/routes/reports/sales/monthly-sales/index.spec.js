/**
 * Author: Malcolm Abdullah
 * Date: January 19th, 2025
 * File: index.spec.js
 * Description: Tests for the Monthly sales API in the APRE app
 */

//Require the needed modules
const request = require ('supertest');
const app = require('../../../../../src/app');
const {mongo} = require ('../../../../../src/utils/mongo');

jest.mock('../../../../../src/utils/mongo');

// Test the monthly sales API
describe('Apre Monthly Sales API', ()=> {
  beforeEach(()=>{
    mongo.mockClear();
  });

  //Test the Monthly-sales endpoint
  it('should fetch sales data for a specified month', async()=> {
    mongo.mockImplementation(async (callback)=> {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              salesData: [
                {
                  date: "2023-10-01T00:00:00Z",
                  region: "South",
                  salesPerson: "Jane Smith",
                  amount: 1500
                },
                {
                  date: "2023-10-15T00:00:00Z",
                  region: "North",
                  salesPerson: "Joey Smith",
                  amount: 3000
                },
              ],
              totalSales: 4500
            }
          ])
        })
      };
      await callback(db);
    });

    //Send a GET request to the Monthly Sales enpoint
    const response = await request(app).get('/api/reports/sales/monthly-sales?month=10');

    //expect a 200 status code
    expect(response.status).toBe(200);

    //Expect the response to match the expected data
    expect(response.body).toEqual([
      {
      totalSales: 4500,
      salesData:[
        {
        date: "2023-10-01T00:00:00Z",
        region: "South",
        salesPerson: "Jane Smith",
        amount: 1500
        },
        {
        date: "2023-10-15T00:00:00Z",
        region: "North",
        salesPerson: "Joey Smith",
        amount: 3000
        }]
    }
    ]);
  });

  it('should return a 400 if parameter is missing', async ()=> {
    //Send a GET request to the Monthly Sales with missing month
    const response = await request(app).get('/api/reports/sales/monthly-sales');

    //Expect a 400 status code
    expect(response.status).toBe(400);

    //Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: "Month is required",
      status: 400,
      type: 'error'
    });
  });

  //Test the Monthly Sales endpoint with an invalid month
  it('should return 404 for an invalid request', async () => {
    //Send a GET request with invalid endpoint
    const response = await request(app).get('/api/reports/sales/monthly-sales/wrong-turn');

    //expect a 404 status code
    expect(response.status).toBe(404);

    //Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});