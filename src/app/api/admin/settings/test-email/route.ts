import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const emailConfig = await request.json();

    // Create transporter with provided settings
    const transporter = nodemailer.createTransporter({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpPort === 465,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPassword,
      },
    });

    // Send test email
    const testEmail = {
      from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      to: (session.user as any).email || 'admin@darkbyte.in',
      subject: 'DarkByte Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Email Configuration Test</h2>
          <p>This is a test email to verify your SMTP configuration is working correctly.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Configuration Details:</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${emailConfig.smtpHost}</li>
              <li><strong>SMTP Port:</strong> ${emailConfig.smtpPort}</li>
              <li><strong>From Email:</strong> ${emailConfig.fromEmail}</li>
              <li><strong>From Name:</strong> ${emailConfig.fromName}</li>
            </ul>
          </div>
          <p>If you received this email, your SMTP configuration is working correctly!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent from DarkByte Admin Panel<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(testEmail);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
