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
          toArray: jest.fn().apply.mockResolvedValue([
            
          ])
        })
      }
    })
  });
});