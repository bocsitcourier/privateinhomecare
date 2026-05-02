interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const APP_BASE_URL = (process.env.APP_URL || 'https://privateinhomecaregiver.com').replace(/\/$/, '');

const escapeHtml = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const safeUrlPart = (s: unknown): string => encodeURIComponent(String(s ?? '').trim());

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log('[EMAIL] Resend API key not configured. Email would have been sent:');
    console.log('[EMAIL] To:', options.to);
    console.log('[EMAIL] Subject:', options.subject);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[EMAIL] Body:', options.html);
    } else {
      console.log('[EMAIL] Body: [redacted in production - configure RESEND_API_KEY to actually send]');
    }
    return { success: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('[EMAIL] Failed to send email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    const result = await response.json();
    console.log('[EMAIL] Email sent successfully:', result.id);
    return { success: true };
  } catch (error: any) {
    console.error('[EMAIL] Error sending email:', error);
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
  const baseUrl = APP_BASE_URL;

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
          <p>A new application has been submitted for the position: <strong>${escapeHtml(application.jobTitle)}</strong></p>
          
          <div class="field">
            <div class="label">Applicant Name:</div>
            <div class="value">${escapeHtml(application.fullName)}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${safeUrlPart(application.email)}">${escapeHtml(application.email)}</a></div>
          </div>
          
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value"><a href="tel:${safeUrlPart(application.phone)}">${escapeHtml(application.phone)}</a></div>
          </div>
          
          ${application.address ? `
          <div class="field">
            <div class="label">Address:</div>
            <div class="value">${escapeHtml(application.address)}</div>
          </div>
          ` : ''}
          
          ${application.backgroundScreeningConsent ? `
          <div class="field">
            <div class="label">Background Screening Consent:</div>
            <div class="value">${escapeHtml(application.backgroundScreeningConsent)}</div>
          </div>
          ` : ''}
          
          ${application.certificationType ? `
          <div class="field">
            <div class="label">Certification:</div>
            <div class="value">${escapeHtml(application.certificationType)}</div>
          </div>
          ` : ''}
          
          ${application.drivingStatus ? `
          <div class="field">
            <div class="label">Driving Status:</div>
            <div class="value">${escapeHtml(application.drivingStatus.replace(/_/g, ' '))}</div>
          </div>
          ` : ''}
          
          ${application.availability && application.availability.length > 0 ? `
          <div class="field">
            <div class="label">Availability:</div>
            <div class="value">${escapeHtml(application.availability.join(', '))}</div>
          </div>
          ` : ''}
          
          ${application.startDate ? `
          <div class="field">
            <div class="label">Available Start Date:</div>
            <div class="value">${escapeHtml(application.startDate)}</div>
          </div>
          ` : ''}
          
          ${application.yearsExperience !== undefined ? `
          <div class="field">
            <div class="label">Years of Experience:</div>
            <div class="value">${escapeHtml(String(application.yearsExperience))} years</div>
          </div>
          ` : ''}
          
          ${application.specialSkills && application.specialSkills.length > 0 ? `
          <div class="field">
            <div class="label">Special Skills:</div>
            <div class="value">${escapeHtml(application.specialSkills.join(', '))}</div>
          </div>
          ` : ''}
          
          ${application.resumeUrl ? `
          <div class="field">
            <div class="label">Resume:</div>
            <div class="value"><a href="${baseUrl}${escapeHtml(application.resumeUrl)}">Download Resume</a></div>
          </div>
          ` : ''}
          
          ${application.coverLetter ? `
          <div class="field">
            <div class="label">Cover Letter:</div>
            <div class="value" style="white-space: pre-wrap;">${escapeHtml(application.coverLetter)}</div>
          </div>
          ` : ''}
          
          <a href="${baseUrl}/admin" class="button">View in Admin Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from your Private InHome CareGiver job application system.</p>
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
  const baseUrl = APP_BASE_URL;

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
            <div class="value">${escapeHtml(inquiry.name)}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${safeUrlPart(inquiry.email)}">${escapeHtml(inquiry.email)}</a></div>
          </div>
          
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value"><a href="tel:${safeUrlPart(inquiry.phone)}">${escapeHtml(inquiry.phone)}</a></div>
          </div>
          
          ${inquiry.service ? `
          <div class="field">
            <div class="label">Service Interested:</div>
            <div class="value">${escapeHtml(inquiry.service)}</div>
          </div>
          ` : ''}
          
          ${inquiry.message ? `
          <div class="field">
            <div class="label">Message:</div>
            <div class="value" style="white-space: pre-wrap;">${escapeHtml(inquiry.message)}</div>
          </div>
          ` : ''}
          
          <a href="${baseUrl}/admin/inquiries" class="button">View in Admin Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from your Private InHome CareGiver consultation system.</p>
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
  const baseUrl = APP_BASE_URL;

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
              <div class="value">${escapeHtml(referral.referrerName)}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${safeUrlPart(referral.referrerEmail)}">${escapeHtml(referral.referrerEmail)}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value"><a href="tel:${safeUrlPart(referral.referrerPhone)}">${escapeHtml(referral.referrerPhone)}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Relationship to Referred:</div>
              <div class="value">${escapeHtml(referral.relationshipToReferred)}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Referred Person Information</div>
            
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${escapeHtml(referral.referredName)}</div>
            </div>
            
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value"><a href="tel:${safeUrlPart(referral.referredPhone)}">${escapeHtml(referral.referredPhone)}</a></div>
            </div>
            
            ${referral.referredEmail ? `
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${safeUrlPart(referral.referredEmail)}">${escapeHtml(referral.referredEmail)}</a></div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Location:</div>
              <div class="value">${escapeHtml(referral.referredLocation)}</div>
            </div>
            
            <div class="field">
              <div class="label">Primary Need for Care:</div>
              <div class="value">${escapeHtml(referral.primaryNeedForCare)}</div>
            </div>
            
            ${referral.additionalInfo ? `
            <div class="field">
              <div class="label">Additional Information:</div>
              <div class="value" style="white-space: pre-wrap;">${escapeHtml(referral.additionalInfo)}</div>
            </div>
            ` : ''}
          </div>
          
          <a href="${baseUrl}/admin/referrals" class="button">View in Admin Dashboard</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from your Private InHome CareGiver referral system.</p>
          <p>Remember to track this referral for potential incentive rewards!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
