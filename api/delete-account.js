export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, reason } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Use environment variables if available, otherwise use provided defaults
    const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_7Nkeuvpm_EShMRS8bNsf8DcCPXf4jimc7';
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'support@airmass.co.zw';
    const TO_EMAIL = 'tapiwa@airmass.co.zw';

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: TO_EMAIL,
                subject: 'Account Deletion Request - Airmass Xpress',
                html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #2a2d72;">Account Deletion Request</h1>
            <p>A user has requested their account be deleted from the Airmass Xpress app.</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>User Email:</strong> ${email}</p>
              <p><strong>Reason for leaving:</strong> ${reason || 'No reason provided'}</p>
            </div>
            <p style="color: #666; font-size: 0.8rem;">This request was submitted via the website's account deletion form.</p>
          </div>
        `,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({
                success: true,
                message: 'Request submitted successfully. We will process it within 7 days.'
            });
        } else {
            console.error('Resend API Error:', data);
            return res.status(response.status).json({
                success: false,
                message: data.message || 'Failed to send request. Please try again later.'
            });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
}
