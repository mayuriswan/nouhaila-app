const express = require('express');
const { Client } = require('pg');
const csv = require('fast-csv');

// create a new PostgreSQL client instance
const client = new Client({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432 // or your custom port number
});

// create an Express application instance
const app = express();

// define a route that generates and serves the CSV file
app.get('/csv', (req, res) => {
  // connect to the PostgreSQL server
  client.connect();

  // run a query to retrieve data from the database
  client.query('SELECT * FROM your_table', (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error generating CSV file');
    }

    // transform the query result to an array of arrays (rows and columns)
    const data = result.rows.map(row => Object.values(row));

    // format the data as a CSV file and send it as a response
    res.setHeader('Content-disposition', 'attachment; filename=output.csv');
    res.set('Content-Type', 'text/csv');

    csv.writeToStream(res, data, { headers: true })
      .on('finish', () => {
        console.log('CSV file sent successfully!');
        client.end();
      });
  });
});

// start the HTTP server
app.listen(3000, () => {
  console.log('HTTP server listening on port 3000');
});
