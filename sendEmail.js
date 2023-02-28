const { Client } = require('pg');
const csv = require('fast-csv');
const fs = require('fs');
const nodemailer = require('nodemailer');

// create a new PostgreSQL client instance
const client = new Client({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432 // or your custom port number
});

// connect to the PostgreSQL server
client.connect();

// run a query to retrieve data from the database
client.query('SELECT * FROM your_table', (err, res) => {
  if (err) {
    console.error(err);
    return;
  }

  // transform the query result to an array of arrays (rows and columns)
  const data = res.rows.map(row => Object.values(row));

  // write the data to a CSV file
  const csvStream = csv.format({ headers: true });
  const writableStream = fs.createWriteStream('output.csv');

  csvStream.pipe(writableStream).on('finish', () => {
    console.log('CSV file generated successfully!');

    // create a Nodemailer transport object
    const transporter = nodemailer.createTransport({
      service: 'your_email_service',
      auth: {
        user: 'your_email_address',
        pass: 'your_email_password'
      }
    });

    // define the email options
    const mailOptions = {
      from: 'your_email_address',
      to: 'recipient_email_address',
      subject: 'CSV file from PostgreSQL database',
      text: 'Please find attached the CSV file generated from your PostgreSQL database.',
      attachments: [
        {
          filename: 'output.csv',
          path: './output.csv'
        }
      ]
    };

    // send the email with the CSV file attachment
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`Email sent successfully: ${info.response}`);
      client.end();
    });
  });

  data.forEach(row => csvStream.write(row));
  csvStream.end();
});
