import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { values } = req.body;  // array di dati da inserire
  if (!values) return res.status(400).send('No values provided');

  // Configura OAuth con le tue credenziali
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),  // vedi passo 3
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: '18pGALej-Xpwo4Yih1zYCBJZjPE6r2jk9MXihSLzci-k',
      range: 'ORDINI!A1', // foglio e cella iniziale
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] },
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore scrittura sheet' });
  }
}
