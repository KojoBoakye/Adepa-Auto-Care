const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Service account credentials
const credentials = {
  client_email: "bay25washingbay@automatic-bliss-453020-j5.iam.gserviceaccount.com",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqFjE2jyz3E/jE
t45dLi4Jxc15X4Q2EL10oqDymOejymgh+c6CLLOkznkZpKL+s8NWNpjOu/mCzZJr
Ym0M8oxz4rZwyND97kt0tDmUWfkG/F4Eaq2JaseDsnAtyrowkgJ6q1mFyt5DRlM5
3co5b7sSgXFrcor/8ZqvpGPWF2zZtc746tVV8PnoMdeKmvPi7prvlZpHOdlg1kzV
LDJJ2N3g2wY0nss/FIv5qcy3GBh0YruwJkALOkSqEsOt0QfxjavNdpdxfD/Kc4wx
xvqwsZpvnruSNNAbVcGtZmuV1HNqI2FAI5gHh+8wpHFM1MIsSn6wkRvX9Z1eXsd8
XDj4U1k5AgMBAAECggEABZDemSkYCPlYtpJFqL+0Prpf+hjxtgW3929DelDd4q6i
1/rJYtnk4o+lp5zLPy/BhIqal0hQNtM0l4pD5Iyy4y9v9jKiIS8pPbdQm43SsAN1
7anShjjN8N233U3BKEn85ggBsNbFzXiJjG8ZOSYyfl1pSWF5Ej1VKSqFYFoJpDmo
xtIv+3OiPFe6ZMDoKiObrHIjBXkf3tVzOr4mT0mvxvVlF03/IcNPWKD+feuP2x4M
x+SvUIdK+WxKckpnrqcbFYqKjOfrc7oaC8xU67ie7U4mibdRmmFMXRBDfcQa5Kbd
FuyrH0MgBP4sNG7IPXEsMafgjzczpzDK6J26UQlEYQKBgQDkcWkLn7hL+XmkkH/t
XEa0gZya2ec74GbsHrPfLNw07DZaj6vEg0U7JqaQbmNQ+UpNt5YXeLt3NUSyGa51
cddU/gVTDdFON4S+Zuuthr/k3kUc9gYnyJOZEODYD+Rz9pr2sKt3Ve9G6XKuPifY
HiEpx4dUrKnwL9Pgl0IFz1lSmQKBgQC+mqt8X9wOo3KBMfa/UUA02RkvsscQCltJ
Wm/ImAqDi9UVUi/WSK+nu0rXjCheiOia3DPNaL+W3UPmkQjG7Kk5n0b/98MxPUec
bkGl/0+SLDiWlWU3J0aCRf6YGbQs5mESDy1lzSA9qxFUczrSiviocZoRhkC5p1mE
NAh/IuD/oQKBgBiZQbd3tm+v6HJZAP19LzvmrQdbqXOgIVURpUrF2Nx2BxBPYi6h
+AV7jvoEePtSLLcbqrTSUlVuzfvjmg6ZeJd1VvtvhHdIsSmTiZNA7EgDiyuoLleA
WKxlzeBWLcJy7pLbyUrrXP2ky62Jkd7Kt8V479ClWxM7AzSu9PQNNNAZAoGAfU/U
9LVVSS5+ZqBBuHCjxNsCqxBfvZUBhU129qu3Jds2IYliOACbs6v4PZRBKj3ap42k
ZSS76WTZcmniGl6Xt3GXTUxIQUQno5n9gTREzTZTkfTwkX055wY7pyYnBeoE4cmm
sCpXSxQAFcSYZLnHV38wqtrYDPcQbFGFUIjO4mECgYEAmj8VWuOqJN2AkCQfRQsu
RSqZ3rasI1tgWWbbcjjqamWd5Q2P4zYcxXjuavQj5LwQzHOTMrehacVjwUJdUrhA
g55DogVaX8QwPO2h/tQ/hl9mlQQzajhb2EEYnR4mdyKvfr+Mwvh41iPT/ZOpBmi3
tDJ8G7P1HAq8XWwk982YZ8E=
-----END PRIVATE KEY-----`.replace(/\\n/g, '\n'),
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
  'Timestamp': row[headers.indexOf('Timestamp')] || new Date().toISOString()
});

// Initialize connection
(async function() {
  try {
    await doc.loadInfo();
    console.log('Connected to Google Sheet:', doc.title);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
})();

// Data endpoint
app.get('/data', async (req, res) => {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const headers = sheet.headerValues;

    const formattedData = rows.map(row => mapRowData(row._rawData, headers));
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save endpoint
app.post('/save', async (req, res) => {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const headers = sheet.headerValues;

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
      'Timestamp': new Date().toISOString()
    };

    await sheet.addRow(newRow);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});