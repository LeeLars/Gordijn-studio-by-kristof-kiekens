import { Router } from 'express';
import { Resend } from 'resend';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/contact', async (req, res) => {
  try {
    const { naam, email, telefoon, bericht } = req.body;

    if (!naam || !email || !bericht) {
      return res.status(400).json({ 
        success: false, 
        error: 'Naam, email en bericht zijn verplicht' 
      });
    }

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Gordijn Studio <info@gordijnstudio.be>',
      to: process.env.EMAIL_TO || 'info@gordijnstudio.be',
      replyTo: email,
      subject: `Nieuw contactformulier van ${naam}`,
      html: `
        <h2>Nieuw bericht via contactformulier</h2>
        <p><strong>Naam:</strong> ${naam}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefoon:</strong> ${telefoon || 'Niet opgegeven'}</p>
        <p><strong>Bericht:</strong></p>
        <p>${bericht.replace(/\n/g, '<br>')}</p>
      `,
      text: `
Nieuw bericht via contactformulier

Naam: ${naam}
E-mail: ${email}
Telefoon: ${telefoon || 'Niet opgegeven'}

Bericht:
${bericht}
      `
    });

    res.json({ success: true, messageId: data.data?.id });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Er ging iets mis bij het versturen' 
    });
  }
});

export default router;
