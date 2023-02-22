'use strict';
const express = require('express');
require('dotenv').config()
// const connectToMongoDB = require('./app/config/db');
// const routes = require('./app/routes/api');
// const { error } = require('./app/helpers/responseApi');

const app = express();

const port = process.env.APP_PORT || 3000;
const host = process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0';

// app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json(error('Invalid Request', res.statusCode));
});


app.listen(port, host, () => {
  console.log(`Server is running in ${host} port ${port}`);
});