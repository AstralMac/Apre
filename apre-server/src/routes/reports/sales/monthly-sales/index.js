/**
 * Author: Malcolm Abdullah
 * Date: January 19th, 2025
 * File: index.js
 * Description: Monthly Sales API for Apre app
*/
'use strict';

const express = require('express');
const {mongo} = require('../../../../utils/mongo');
const router = express.Router();
const createError = require ('http-errors');

/**
 * @description
 * GET /monthly-sales
 *
 * Fetches a sales data for a specified month.
 *
 * Example:
 * fetch('/sales')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */

//fetches sales data
router.get('/monthly-sales', (req, res, next) => {
  try{
    const {month} = req.query;

    if(!month){
      return next(createError(400, 'Month is required'));
    }

    //Connect to Mongo DB and request data
    mongo(async db => {
      const data = await db.collection('sales').aggregate([
        {
          $addFields: {
            month:{$month: {$toDate: '$date'}}, //extracting the month directly
          },
        },
        {
          $match: {
            month: Number(month) //Match the requested month
          }
        },
        {
          $group: {
            _id: '$salesperson',
            totalSales: {$sum: '$amount'}, //Sum of sales amount
            salesData: {
              $push:{
                date: '$date',
                region: '$region',
                salesperson: '$salesperson',
                amount: '$amount'
              }
            }
          }
        },
        {
          $project:{
            _id:0,
            totalSales: 1,
            salesData: 1
          }
        },
        {
          $sort: {
            salesperson: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);
  }catch(err){
    console.error('Error with Monthly Sales endpoint', err);
    next(err);
  }
});

module.exports = router;