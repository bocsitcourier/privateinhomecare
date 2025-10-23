import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// OAuth2 Configuration for Gmail
const OAuth2 = google.auth.OAuth2;

async function createGmailTransporter() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  if (!clientId || !clientSecret || !refreshToken) {
    console.log('[EMAIL] OAuth2 configuration incomplete:', {
      CLIENT_ID: !!clientId,
      CLIENT_SECRET: !!clientSecret,
      GMAIL_REFRESH_TOKEN: !!refreshToken
    });
    return null;
  }

  const oauth2Client = new OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  try {
    console.log('[EMAIL] Getting access token...');
    const accessToken = await oauth2Client.getAccessToken();
    console.log('[EMAIL] Access token obtained:', accessToken.token ? 'SUCCESS' : 'FAILED');
    
    // Use the generic createTransport with proper typing
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: fromEmail,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken.token,
      },
    } as any); // Type assertion to bypass strict typing

    return transporter;
  } catch (error) {
    console.error('[EMAIL] Error creating OAuth2 transporter:', error);
    return null;
  }
}

async function createSMTPTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || '587';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  
  if (!fromEmail) {
    return { success: false, error: 'FROM_EMAIL not configured' };
  }

  // Try SMTP first for testing, then OAuth2
  let transporter: any = await createGmailTransporter();
  let authMethod = 'SMTP';
  
    console.log('[EMAIL] SMTP not available, trying OAuth2...');
    authMethod = 'OAuth2';

  if (!transporter) {
    console.log('[EMAIL] No email configuration available. Email would have been sent:');
    console.log('[EMAIL] To:', options.to);
    console.log('[EMAIL] Subject:', options.subject);
    console.log('[EMAIL] Body:', options.html);
    return { success: true };
  }

  try {
    // Send email
    const info = await transporter.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[EMAIL] Email sent successfully via ${authMethod}:`, info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error(`[EMAIL] Error sending email via ${authMethod}:`, error);
    return { success: false, error: error.message };
  }
}

export function generateApplicationNotificationEmail(application: {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  address?: string;
  backgroundScreeningConsent?: string;
  certificationType?: string;
  drivingStatus?: string;
  availability?: string[];
  startDate?: string;
  yearsExperience?: number;
  specialSkills?: string[];
  resumeUrl?: string;
  coverLetter?: string;
}): string {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #6b7280; }
        .value { margin-top: 5px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Job Application Received</h1>
        </div>
        <div class="content">
          <p>A new application has been submitted for the position: <strong>${application.jobTitle}</strong></p>
          
          <div class="field">
            <div class="label">Applicant Name:</div>
            <div class="value">${application.fullName}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${application.email}">${application.email}</a></div>
          </div>
          
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value"><a href="tel:${application.phone}">${application.phone}</a></div>
          </div>
          
          ${application.address ? `
          <div class="field">
            <div class="label">Address:</div>
            <div class="value">${application.address}</div>
          </div>
          ` : ''}
          
          ${application.backgroundScreeningConsent ? `
          <div class="field">
            <div class="label">Background Screening Consent:</div>
            <div class="value">${application.backgroundScreeningConsent}</div>
          </div>
          ` : ''}
          
          ${application.certificationType ? `
          <div class="field">
            <div class="label">Certification:</div>
            <div class="value">${application.certificationType}</div>
          </div>
          ` : ''}
          
          ${application.drivingStatus ? `
          <div class="field">
            <div class="label">Driving Status:</div>
            <div class="value">${application.drivingStatus.replace(/_/g, ' ')}</div>
          </div>
          ` : ''}
          
          ${application.availability && application.availability.length > 0 ? `
          <div class="field">
            <div class="label">Availability:</div>
            <div class="value">${application.availability.join(', ')}</div>
          </div>
          ` : ''}
          
          ${application.startDate ? `
          <div class="field">
            <div class="label">Available Start Date:</div>
            <div class="value">${application.startDate}</div>
          </div>
          ` : ''}
          
          ${application.yearsExperience !== undefined ? `
          <div class="field">
            <div class="label">Years of Experience:</div>
            <div class="value">${application.yearsExperience} years</div>
          </div>
          ` : ''}
          
          ${application.specialSkills && application.specialSkills.length > 0 ? `
          <div class="field">
            <div class="label">Special Skills:</div>
            <div class="value">${application.specialSkills.join(', ')}</div>
          </div>
          ` : ''}
          
          ${application.resumeUrl ? `
          <div class="field">
            <div class="label">Resume:</div>
            <div class="value"><a href="${baseUrl}${application.resumeUrl}">Download Resume</a></div>
          </div>
          ` : ''}
          
          ${application.coverLetter ? `
          <div class="field">
            <div class="label">Cover Letter:</div>
            <div class="value" style="white-space: pre-wrap;">${application.coverLetter}</div>
          </div>
          ` : ''}
          
          <a href="${baseUrl}/admin" class="button">View in Admin Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from your PrivateInHomeCareGiver job application system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateInquiryNotificationEmail(inquiry: {
  name: string;
  email: string;
  phone: string;
  service?: string;
  message?: string;
}): string {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #6b7280; }
        .value { margin-top: 5px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Consultation Request</h1>
        </div>
        <div class="content">
          <p>A new consultation inquiry has been submitted through your website.</p>
          
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${inquiry.name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${inquiry.email}">${inquiry.email}</a></div>
          </div>
          
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value"><a href="tel:${inquiry.phone}">${inquiry.phone}</a></div>
          </div>
          
          ${inquiry.service ? `
          <div class="field">
            <div class="label">Service Interested:</div>
            <div class="value">${inquiry.service}</div>
          </div>
          ` : ''}
          
          ${inquiry.message ? `
          <div class="field">
            <div class="label">Message:</div>
            <div class="value" style="white-space: pre-wrap;">${inquiry.message}</div>
          </div>
          ` : ''}
          
          <a href="${baseUrl}/admin/inquiries" class="button">View in Admin Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from your PrivateInHomeCareGiver consultation system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateReferralNotificationEmail(referral: {
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string;
  relationshipToReferred: string;
  referredName: string;
  referredPhone: string;
  referredEmail?: string;
  referredLocation: string;
  primaryNeedForCare: string;
  additionalInfo?: string;
}): string {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 16px; font-weight: bold; color: #7c3aed; margin-bottom: 10px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #6b7280; }
        .value { margin-top: 5px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Client Referral</h1>
        </div>
        <div class="content">
          <p>A new client referral has been submitted through your referral program.</p>
          
          <div class="section">
            <div class="section-title">Referrer Information</div>
            
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${referral.referrerName}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${referral.referrerEmail}">${referral.referrerEmail}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value"><a href="tel:${referral.referrerPhone}">${referral.referrerPhone}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Relationship to Referred:</div>
              <div class="value">${referral.relationshipToReferred}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Referred Person Information</div>
            
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${referral.referredName}</div>
            </div>
            
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value"><a href="tel:${referral.referredPhone}">${referral.referredPhone}</a></div>
            </div>
            
            ${referral.referredEmail ? `
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${referral.referredEmail}">${referral.referredEmail}</a></div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Location:</div>
              <div class="value">${referral.referredLocation}</div>
            </div>
            
            <div class="field">
              <div class="label">Primary Need for Care:</div>
              <div class="value">${referral.primaryNeedForCare}</div>
            </div>
            
            ${referral.additionalInfo ? `
            <div class="field">
              <div class="label">Additional Information:</div>
              <div class="value" style="white-space: pre-wrap;">${referral.additionalInfo}</div>
            </div>
            ` : ''}
          </div>
          
          <a href="${baseUrl}/admin/referrals" class="button">View in Admin Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from your PrivateInHomeCareGiver referral system.</p>
          <p>Remember to track this referral for potential incentive rewards!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateInquiryReplyEmail(inquiry: {
  name: string;
}, replyMessage: string): string {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #6b7280; }
        .value { margin-top: 5px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Reply from admin</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${inquiry.name}</div>
          </div>
          
          <div class="field">
            <div class="label">Reply:</div>
            <div class="value">${replyMessage}</div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from your PrivateInHomeCareGiver consultation system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}