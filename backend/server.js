const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Service account credentials
const credentials = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

// Auth client setup
const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Google Sheet connection
const doc = new GoogleSpreadsheet("1WcYlBR_lmzPa6CBufdm1ALqaUOYZk5jQQRwh9aGMpN8", auth);

// Helper function to map row data
const mapRowData = (row, headers) => ({
  'Car Model': row[headers.indexOf('Car Model')] || '-',
  'Car Type/Make': row[headers.indexOf('Car Type/Make')] || '-',
  'Car Number': row[headers.indexOf('Car Number')] || '-',
  'Primary Service': row[headers.indexOf('Primary Service')] || '-',
  'Secondary Service': row[headers.indexOf('Secondary Service')] || '-',
  'Washer Name': row[headers.indexOf('Washer Name')] || '-',
  'Mobile Number': row[headers.indexOf('Mobile Number')] || '-',
  'Email': row[headers.indexOf('Email')] || '-',
  'Payment Type': row[headers.indexOf('Payment Type')] || '-',
  'Total Amount (GHS)': parseFloat(row[headers.indexOf('Total Amount (GHS)')] || 0),
  'Washer Commission (GHS)': parseFloat(row[headers.indexOf('Washer Commission (GHS)')] || 0),
  'Company Commission (GHS)': parseFloat(row[headers.indexOf('Company Commission (GHS)')] || 0),
  'Timestamp': row[headers.indexOf('Timestamp')] || new Date().toISOString(),
});

// Initialize connection to Google Sheets
(async function initializeConnection() {
  try {
    console.log('Connecting to Google Sheets...');
    await doc.loadInfo();
    console.log('Connected to Google Sheet:', doc.title);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
})();

// Data endpoint
app.get('/api/data', async (req, res) => {
  try {
    console.log('Fetching data from Google Sheets...');
    await doc.loadInfo(); // Ensure the document is loaded
    const sheet = doc.sheetsByIndex[0]; // Access the first sheet
    const rows = await sheet.getRows();
    const headers = sheet.headerValues;

    if (!headers || headers.length === 0) {
      throw new Error('No headers found in the sheet.');
    }

    const formattedData = rows.map(row => mapRowData(row._rawData, headers));
    console.log('Data fetched successfully. Rows:', formattedData.length);
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Save endpoint
app.post('/api/save', async (req, res) => {
  try {
    console.log('Saving data to Google Sheets...');
    await doc.loadInfo(); // Ensure the document is loaded
    const sheet = doc.sheetsByIndex[0]; // Access the first sheet

    const newRow = {
      'Car Model': req.body.carModel,
      'Car Type/Make': req.body.carType,
      'Car Number': req.body.carNumber,
      'Primary Service': req.body.serviceType1,
      'Secondary Service': req.body.serviceType2,
      'Washer Name': req.body.washerName,
      'Mobile Number': req.body.mobileNumber,
      'Email': req.body.email || '',
      'Payment Type': req.body.paymentType,
      'Total Amount (GHS)': Number(req.body.amount).toFixed(2),
      'Washer Commission (GHS)': Number(req.body.washerCommission).toFixed(2),
      'Company Commission (GHS)': Number(req.body.companyCommission).toFixed(2),
      'Timestamp': new Date().toISOString(),
    };

    await sheet.addRow(newRow);
    console.log('Data saved successfully:', newRow);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});