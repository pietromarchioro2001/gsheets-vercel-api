import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT), // chiave service account
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const SHEET_ID = '18pGALej-Xpwo4Yih1zYCBJZjPE6r2jk9MXihSLzci-k';
    const SHEET_NAME = 'ORDINI';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });

    res.status(200).json({ values: response.data.values || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore lettura Sheet' });
  }
}
