import { Router } from 'express';
import { Resend } from 'resend';
import cloudinary from '../../config/cloudinary.js';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

const INQUIRIES_PUBLIC_ID = 'gordijnstudio/settings/inquiries';

async function readInquiries() {
  try {
    const result = await cloudinary.api.resource(INQUIRIES_PUBLIC_ID, { resource_type: 'raw' });
    const response = await fetch(result.secure_url);
    return await response.json();
  } catch (err) {
    return [];
  }
}

async function writeInquiries(data) {
  const jsonString = JSON.stringify(data, null, 2);
  const base64String = Buffer.from(jsonString, 'utf-8').toString('base64');
  const dataUri = 'data:application/json;base64,' + base64String;
  await cloudinary.uploader.upload(dataUri, {
    public_id: INQUIRIES_PUBLIC_ID,
    resource_type: 'raw',
    overwrite: true
  });
}

router.post('/contact', async (req, res) => {
  try {
    const { naam, email, telefoon, voorkeur, bericht } = req.body;

    if (!naam || !email) {
      return res.status(400).json({
        success: false,
        error: 'Naam en email zijn verplicht'
      });
    }

    const inquiry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      naam,
      email,
      telefoon: telefoon || '',
      voorkeur: voorkeur || '',
      bericht: bericht || '',
      datum: new Date().toISOString(),
      gelezen: false
    };

    const inquiries = await readInquiries();
    inquiries.unshift(inquiry);
    await writeInquiries(inquiries);

    const emailFrom = process.env.EMAIL_FROM
      ? `Gordijn Studio <${process.env.EMAIL_FROM}>`
      : 'Gordijn Studio <onboarding@resend.dev>';

    const notifyRecipients = (process.env.EMAIL_TO || 'info@kristofkiekens.be')
      .split(/[\s,;]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    try {
      await resend.emails.send({
        from: emailFrom,
        to: notifyRecipients,
        replyTo: email,
        subject: `Nieuwe aanvraag van ${naam}`,
        html: `
          <h2 style="color:#848374;font-family:Georgia,serif;">Nieuwe aanvraag via website</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Naam</td><td style="padding:8px 0;">${naam}</td></tr>
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">E-mail</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Telefoon</td><td style="padding:8px 0;">${telefoon || 'Niet opgegeven'}</td></tr>
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Voorkeurmoment</td><td style="padding:8px 0;">${voorkeur || 'Niet opgegeven'}</td></tr>
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Bericht</td><td style="padding:8px 0;">${bericht || 'Geen bericht'}</td></tr>
          </table>
          <p style="margin-top:2rem;color:#999;font-size:12px;">Via gordijnstudio.be contactformulier</p>
        `,
        text: `Nieuwe aanvraag via website\n\nNaam: ${naam}\nE-mail: ${email}\nTelefoon: ${telefoon || 'Niet opgegeven'}\nVoorkeurmoment: ${voorkeur || 'Niet opgegeven'}\nBericht: ${bericht || 'Geen bericht'}`
      });
    } catch (emailErr) {
      console.error('Email send error (inquiry still saved):', emailErr);
    }

    try {
      await resend.emails.send({
        from: emailFrom,
        to: email,
        subject: 'Bevestiging van uw aanvraag — Gordijn Studio by Kristof Kiekens',
        html: `
          <div style="max-width:560px;margin:0 auto;font-family:Georgia,'Times New Roman',serif;color:#2c2c2c;">
            <div style="text-align:center;padding:2rem 0 1.5rem;border-bottom:1px solid #e8e6e0;">
              <h1 style="font-size:22px;font-weight:400;color:#848374;margin:0;letter-spacing:1px;">Gordijn Studio</h1>
              <p style="font-size:13px;color:#a09f94;margin:4px 0 0;font-style:italic;">by Kristof Kiekens</p>
            </div>
            <div style="padding:2rem 0;">
              <p style="font-size:15px;line-height:1.7;color:#4a4a4a;">Beste ${naam},</p>
              <p style="font-size:15px;line-height:1.7;color:#4a4a4a;">Bedankt voor uw aanvraag. Wij hebben deze goed ontvangen. Kristof neemt zo snel mogelijk contact met u op om alles verder te bespreken.</p>
              <div style="background:#f8f7f4;border-left:3px solid #848374;padding:1rem 1.2rem;margin:1.5rem 0;">
                <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#848374;">Uw gegevens</p>
                <p style="margin:6px 0;font-size:14px;color:#4a4a4a;"><strong>Naam:</strong> ${naam}</p>
                <p style="margin:6px 0;font-size:14px;color:#4a4a4a;"><strong>E-mail:</strong> ${email}</p>
                <p style="margin:6px 0;font-size:14px;color:#4a4a4a;"><strong>Telefoon:</strong> ${telefoon || 'Niet opgegeven'}</p>
                <p style="margin:6px 0;font-size:14px;color:#4a4a4a;"><strong>Voorkeurmoment:</strong> ${voorkeur || 'Niet opgegeven'}</p>
                <p style="margin:6px 0;font-size:14px;color:#4a4a4a;"><strong>Bericht:</strong> ${bericht || 'Geen bericht'}</p>
              </div>
              <p style="font-size:15px;line-height:1.7;color:#4a4a4a;">Met warme groet,<br>Kristof Kiekens</p>
            </div>
            <div style="border-top:1px solid #e8e6e0;padding:1.2rem 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a09f94;">Gordijn Studio by Kristof Kiekens</p>
              <p style="margin:4px 0 0;font-size:12px;color:#a09f94;">0473 62 53 13 &middot; info@kristofkiekens.be</p>
            </div>
          </div>
        `,
        text: `Beste ${naam},\n\nBedankt voor uw aanvraag. Wij hebben deze goed ontvangen. Kristof neemt zo snel mogelijk contact met u op.\n\nUw gegevens:\nNaam: ${naam}\nE-mail: ${email}\nTelefoon: ${telefoon || 'Niet opgegeven'}\nVoorkeurmoment: ${voorkeur || 'Niet opgegeven'}\nBericht: ${bericht || 'Geen bericht'}\n\nMet warme groet,\nKristof Kiekens\nGordijn Studio by Kristof Kiekens\n0473 62 53 13`
      });
    } catch (confirmErr) {
      console.error('Confirmation email error:', confirmErr);
    }

    res.json({ success: true, id: inquiry.id });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Er ging iets mis bij het versturen'
    });
  }
});

router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await readInquiries();
    res.json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Inquiries read error:', error);
    res.status(500).json({ success: false, error: 'Kon aanvragen niet laden' });
  }
});

router.delete('/inquiries', async (req, res) => {
  try {
    await writeInquiries([]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Kon aanvragen niet wissen' });
  }
});

router.put('/inquiries/:id/read', async (req, res) => {
  try {
    const inquiries = await readInquiries();
    const idx = inquiries.findIndex(i => i.id === req.params.id);
    if (idx !== -1) {
      inquiries[idx].gelezen = true;
      await writeInquiries(inquiries);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Kon niet bijwerken' });
  }
});

export default router;
