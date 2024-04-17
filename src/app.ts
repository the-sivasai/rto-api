import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import axios from 'axios';
import cheerio from 'cheerio';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './interfaces/MessageResponse';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());


// API endpoint is https://rto-api-end.vercel.app/rc-details/TN19ABXXXX

// Middleware to scrape owner name and registered RTO details
app.use('/rc-details/:vehicleNumber', async (req, res, next) => {
  try {
    const { vehicleNumber } = req.params;
    const url = `https://www.carinfo.app/rc-details/${vehicleNumber}`;

    // Make HTTP request to fetch HTML content
    const response = await axios.get(url);
    const html = response.data;

    // Use Cheerio to parse HTML
    const $ = cheerio.load(html);

    // Find the element containing owner name
    const ownerNameElement = $('p:contains("Owner Name")');

    // Find the sibling element containing the actual owner name
    const ownerName = ownerNameElement.length > 0 ? ownerNameElement.nextAll('p').eq(0).text().trim() : 'Owner name not found';


    // Find the element containing registered RTO
    const registeredRTOElement = $('p:contains("Registered RTO")');

    // Find the sibling element containing the actual registered RTO
    const registeredRTO = registeredRTOElement.next('p').text().trim();

    // Send JSON response with scraped data
    res.json({ vehicleNumber,ownerName, registeredRTO,});
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
});

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
