import { google } from 'googleapis';

export default async function handler(req, res) {
  // ===== CORS =====
  res.setHeader('Access-Control-Allow-Origin', '*'); // permette qualsiasi origine
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Risposta per preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { values } = req.body;  // array di dati da inserire
  if (!values) return res.status(400).json({ error: 'No values provided' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: '18pGALej-Xpwo4Yih1zYCBJZjPE6r2jk9MXihSLzci-k',
      range: 'ORDINI!A1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore scrittura sheet' });
  }
}
