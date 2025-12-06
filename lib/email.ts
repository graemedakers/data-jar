
import { Resend } from 'resend';

export async function sendVerificationEmail(email: string, token: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Skipping email verification.");
        console.log(`Verification Token for ${email}: ${token}`);
        return;
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;

    const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Date Jar <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your email for Date Jar',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to Date Jar!</h1>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Verify Email</a>
          <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>If you didn't create an account, you can ignore this email.</p>
        </div>
      `
        });
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
    }
}
