/**
 * Author: Malcolm Abdullah
 * Date: January 25th, 2025
 * File:index.spec.js
 * Description:Tests for Agent Performance by Year api
 */

//require the needed modules
const request = require('supertest');
const app = require('../../../../../src/app');
const {mongo} = require('../../../../../src/utils/mongo');

jest.mock('../../../../../src/utils/mongo');

// Test the "Agent-Performance-by-Year" endpoint
describe('Apre Agent-Performance-by-Year API', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  //Test the Performance by Year endpoint
  it('should fetch agent performance data for a specified year', async() => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              _id: 2023, // The year the data will be grouped by
              agentId: 1001,
              region: "Europe",
              team: "TeleSales Titans",
              metrics: [
                {metricType: "Customer Satisfaction", value:90},
                {metricType: "Sales Conversion", value: 80}
              ],
              totalCallDuration: 500, //Example aggregate call duration
              averageResolutionTime: 100 //Example aggregate resolution time
            }
          ])
        })
      };
      return callback(db);
    });
    //Call the actual funtion you are testing
    const response = await request(app).get('/api/reports/agent-performance/performance-by-year?year=2023');

    //expect a 200 status code
    expect(response.status).toBe(200);

    //Expect the response to match the expected data
    expect(response.body).toEqual([
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
  });

  //Test the endpoint with the year missing
  it('should return a 400 if parameter is missing', async () =>{
    //Send a GET request to the Monthly Sales with missing month
    const response = await request(app).get('/api/reports/agent-performance/performance-by-year');

    expect(response.status).toBe(400);

    //Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: "Year is required",
      status: 400,
      type: 'error'
    });
  });

  //Test the Performance by Year endpoint for a invalid request
  it('should return 404 for an invalid request', async () => {
    //Send a GET request with an invalid endpoint;
    const response = await request(app).get('/api/reports/agent-performance/performance by year/try-again');

    //Expect a 404 status code
    expect(response.status).toBe(404);

    //Expect the response body to match the expect data
    expect(response.body).toEqual({
      message:'Not Found',
      status: 404,
      type: 'error'
    });
  });
});