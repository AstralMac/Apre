/**
 * Author: Malcolm Abdullah
 * Date: January 25th, 2025
 * File: index.js
 * Description: API to get agent performance by year
 */
'use strict';

const express = require('express');
const { mongo } = require('../../../../utils/mongo');
const router = express.Router();
const createError = require('http-errors');

/**
 * @description
 * GET /performance-by-year
 *
 * Fetches agents' performance by year
 */
router.get('/performance-by-year', async (req, res, next) => {
  try {
    const { year } = req.query;

    if (!year) {
      return next(createError(400, 'Year is required'));
    }

    // Connect to MongoDB and request data
    await mongo(async (db) => {
      const data = await db.collection('agentPerformance').aggregate([
        {
          $addFields: {
            year: { $year: { $toDate: '$date' } }, // Extract year from date
          },
        },
        {
          $match: {
            year: Number(year), // Match the year
          },
        },
        {
          $group: {
            _id: { date: '$date',agentId: '$agentId', region: '$region', team: '$team' },
            metrics: { $push: '$performanceMetrics' }, // Collect all performance metrics
            totalCallDuration: { $sum: '$callDuration' }, // Sum call durations
            averageResolutionTime: { $avg: '$resolutionTime' }, // Calculate average resolution time
          },
        },
        {
          $project: {
            _id: 0, // Exclude MongoDB's default _id field
            agentId: '$_id.agentId',
            region: '$_id.region',
            team: '$_id.team',
            metrics: {
              $reduce: {
                input: '$metrics', // Use $reduce to flatten the array
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value', // Accumulated result
                    { $ifNull: ['$$this', []] }, // Ensure each metric is an array
                  ],
                },
              },
            },
            totalCallDuration: 1,
            averageResolutionTime: 1,
          },
        },
      ]).toArray();

      if (!data.length) {
        return next(createError(404, `No performance data found for the year ${year}`));
      }

      res.status(200).json(data);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
