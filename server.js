'use strict';
const express = require('express');
require('dotenv').config()
// const connectToMongoDB = require('./app/config/db');
const routes = require('./routes/api');
const { error } = require('./helpers/responseApi');

const app = express();

// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.APP_PORT || 3000;
const host = process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0';

app.get('/', (req, res) => {
  res.send('hello world')
})
app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json(error('Invalid Request', res.statusCode));
});


app.listen(port, host, () => {
  console.log(`Server is running in ${host} port ${port}`);
});