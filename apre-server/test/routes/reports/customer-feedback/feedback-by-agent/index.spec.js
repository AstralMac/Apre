/**
 * Author: Malcolm Abdullah
 * Date: January 30th, 2025
 * File: index.js
 * Descripton: Tests for the "feedback-by-agent" API
 */

//Require the needed modules
const request = require('supertest');
const app = require('../../../../../src/app');
const {mongo} = require('../../../../../src/utils/mongo');

jest.mock('../../../../../src/utils/mongo');

//Test suite for the feedback-by-agent API
describe('Apre Feedback by Agent API', () => {
  beforeEach(()=> {
    mongo.mockClear();
  });

  //Test the feedback-by-agent endpoint
  it('should fetch customer feedback for a specified agent', async ()=>{
    mongo.mockImplementation(async(callback) => {
      const db= {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              date: "2023-08-14T00:00:00Z",
              customer: "Jim Halpert",
              product: "Smartphone x",
              salesperson: "Michael Scott",
              agentId: 1007,
              rating: 3,
              performanceMetrics: 70,
              feedbackSentiment: "Neutral",
              feedbackText: "Satisfactory, but could be better.",
              feedbackSource: "Phone",
              feedbackStatus: "Reviewed"
            }
          ])
        })
      };
      await callback(db);
    });

    //Send a GET request to the feedback-by-agent endpoint
    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-agent?agentId=1007');

    //expect a 200 status
    expect(response.status).toBe(200);

    //Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        date: "2023-08-14T00:00:00Z",
        customer: "Jim Halpert",
        product: "Smartphone x",
        salesperson: "Michael Scott",
        agentId: 1007,
        rating: 3,
        performanceMetrics: 70,
        feedbackSentiment: "Neutral",
        feedbackText: "Satisfactory, but could be better.",
        feedbackSource: "Phone",
        feedbackStatus: "Reviewed"
      }
    ]);
  });

  it('should return 400 if the agentId parameter is missing', async ()=> {
    //Send a GET request to the feedback-by-agent endpoint missing the agentId
    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-agent');

    //expect a 400 status code
    expect(response.status).toBe(400);

    //expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Agent ID is required.',
      status: 400,
      type: 'error'
    });
  });

  it('should throw a 404 error for invalid endpoint',async () => {
    //Send a GET request to an invalid endpoint
    const response = await request(app).get('/api/reports/customer-feedback/wrong-turn');

    //Expect a 404 status code
    expect(response.status).toBe(404);

    //Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});