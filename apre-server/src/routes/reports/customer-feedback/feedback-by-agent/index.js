/**
 * Author: Malcolm Abdullah
 * Date: January 30th, 2025
 * file: index.js
 * description: Feedback by Agent API
*/
'use strict';

const express = require('express');
const { mongo } = require('../../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 * GET /feedback-by-agent
 *
 * Fetches customer feedback data by specified agentId
 *
 * Example:
 * fetch('/feedback-by-agent?agentId=1007)
 *  .then(response => response.json())
 *  .then(data => console.log(data))
 */

router.get('/feedback-by-agent', (req, res, next) => {
  try{
    const {agentId} = req.query;

    if (!agentId){
      return next(createError(400, 'Agent ID is required.'));
    }

    mongo (async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            agentId: "$agentId"
          },
        },
        {
          $match: {
            agentId: parseInt(agentId), //Match the Agent ID
          },
        },
        {
          $group: {
            _id: {agentId: '$agentId', salesPerson: '$salesperson'},
            customerFeedback: {
              //collect all the needed information for the array
              $push: '$$ROOT'},
            totalFeedback: {$sum:1}, //get a sum of all feedback entries
            averageRating: {$avg: "$rating"} //get an average of all ratings
          },
        },
        {
          $project: {
            _id:0, //To exlude MongoDb's default _id Field
            agentId: "$_id.agentId",
            salesPerson: "$_id.salesPerson",
            customerFeedback: {
              $map: {
                input: "$customerFeedback",
                as: 'feedback',
                in: {
                  date:'$$feedback.date',
                  customer: '$$feedback.customer',
                  product: '$$feedback.product',
                  feedbackText: '$$feedback.feedbackText',
                  feedbackType: '$$feedback.feedbackType',
                  feedbackSentiment: '$$feedback.feedbackSentiment',
                  feedbackSource: '$$feedback.feedbackSource',
                  rating: '$$feedback.rating'
                }
              }
            },
            totalFeedback: 1,
            averageRating: {$round: ['$averageRating',1]},
          }
        }
      ]).toArray();

      if(!data.length) {
        return next(createError(404, `No customer feedback found for agent ${agentId}`));
      }
      res.status(200).json(data);
    })
  } catch (err){
    console.error('Error in /feedback-by-agent', err);
    next(err);
  }
});

module.exports = router;