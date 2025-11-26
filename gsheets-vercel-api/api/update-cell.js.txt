const { google } = require('googleapis');

async function authClient() {
  const saBase64 = process.env.SERVICE_ACCOUNT_BASE64;
  const saJson = JSON.parse(Buffer.from(saBase64, 'base64').toString('utf8'));
  const jwt = new google.auth.JWT(
    saJson.client_email,
    null,
    saJson.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  await jwt.authorize();
  return jwt;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(JSON.parse(data || '{}')));
      req.on('error', reject);
    });

    const { range, sheet, row, col, value } = body;
    if (!range && !(sheet && typeof row === 'number' && typeof col === 'number')) {
      return res.status(400).send({ error: 'range or sheet+row+col required' });
    }

    const auth = await authClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;

    let targetRange = range;
    if (!targetRange) {
      function colToLetter(c) {
        let s = '';
        while (c >= 0) {
          s = String.fromCharCode((c % 26) + 65) + s;
          c = Math.floor(c / 26) - 1;
        }
        return s;
      }
      targetRange = `${sheet}!${colToLetter(col)}${row}`;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[value]] }
    });

    res.status(200).send({ ok: true, range: targetRange });
  } catch (err) {
    console.error('update-cell error', err);
    res.status(500).send({ error: err.message || err.toString() });
  }
};
