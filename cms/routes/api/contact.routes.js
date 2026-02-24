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
    const { naam, email, telefoon, voorkeur } = req.body;

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
      datum: new Date().toISOString(),
      gelezen: false
    };

    const inquiries = await readInquiries();
    inquiries.unshift(inquiry);
    await writeInquiries(inquiries);

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Gordijn Studio <onboarding@resend.dev>',
        to: 'info@kristofkiekens.be',
        replyTo: email,
        subject: `Nieuwe aanvraag van ${naam}`,
        html: `
          <h2 style="color:#848374;font-family:Georgia,serif;">Nieuwe aanvraag via website</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Naam</td><td style="padding:8px 0;">${naam}</td></tr>
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">E-mail</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Telefoon</td><td style="padding:8px 0;">${telefoon || 'Niet opgegeven'}</td></tr>
            <tr><td style="padding:8px 0;color:#848374;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Voorkeurmoment</td><td style="padding:8px 0;">${voorkeur || 'Niet opgegeven'}</td></tr>
          </table>
          <p style="margin-top:2rem;color:#999;font-size:12px;">Via gordijnstudio.be contactformulier</p>
        `,
        text: `Nieuwe aanvraag via website\n\nNaam: ${naam}\nE-mail: ${email}\nTelefoon: ${telefoon || 'Niet opgegeven'}\nVoorkeurmoment: ${voorkeur || 'Niet opgegeven'}`
      });
    } catch (emailErr) {
      console.error('Email send error (inquiry still saved):', emailErr);
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
