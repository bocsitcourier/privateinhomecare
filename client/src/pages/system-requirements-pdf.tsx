import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SystemRequirementsPDF() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden sticky top-0 z-50 bg-background border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex gap-2">
            <Button onClick={handlePrint} data-testid="button-print-pdf">
              <Printer className="w-4 h-4 mr-2" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="print:text-black">
          <div className="text-center mb-8 pb-6 border-b-2 border-primary print:border-black">
            <h1 className="text-3xl font-bold text-primary print:text-black mb-2">
              Private InHome CareGiver
            </h1>
            <h2 className="text-2xl font-semibold mb-2">
              Platinum Care Management System
            </h2>
            <p className="text-lg text-muted-foreground print:text-gray-600">
              System Requirements Document
            </p>
            <p className="text-sm text-muted-foreground print:text-gray-500 mt-2">
              Version 1.0 | {new Date().toLocaleDateString()}
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              1. Executive Summary
            </h2>
            <p className="mb-4 leading-relaxed">
              This document outlines the comprehensive system requirements for the Private InHome CareGiver 
              Platinum Care Management System - an enterprise-grade home care management platform designed 
              to connect Massachusetts families with Personal Care Assistants (PCAs) while providing 
              complete operational management capabilities.
            </p>
            <div className="bg-muted/50 print:bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Key Objectives:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>GPS-validated caregiver time tracking with geofencing</li>
                <li>Multi-role portals for Admin, Caregivers, and Clients/Families</li>
                <li>Comprehensive scheduling and calendar management</li>
                <li>HIPAA-compliant documentation and audit logging</li>
                <li>Integrated invoicing and payment processing</li>
                <li>Multi-channel notifications (Email, SMS, Push)</li>
                <li>Analytics and reporting dashboard</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              2. User Roles & Access Levels
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-muted print:bg-gray-200">
                    <th className="border border-gray-300 p-2 text-left">Role</th>
                    <th className="border border-gray-300 p-2 text-left">Description</th>
                    <th className="border border-gray-300 p-2 text-left">Portal Access</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">Super Admin</td>
                    <td className="border border-gray-300 p-2">Full system access, user management, settings</td>
                    <td className="border border-gray-300 p-2">/admin</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">Manager</td>
                    <td className="border border-gray-300 p-2">Client/caregiver management, scheduling, reporting</td>
                    <td className="border border-gray-300 p-2">/admin</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">Scheduler</td>
                    <td className="border border-gray-300 p-2">Shift scheduling, availability management</td>
                    <td className="border border-gray-300 p-2">/admin</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">Caregiver</td>
                    <td className="border border-gray-300 p-2">Clock in/out, daily logs, view schedule, messaging</td>
                    <td className="border border-gray-300 p-2">/caregiver</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">Client/Family</td>
                    <td className="border border-gray-300 p-2">View care logs, caregivers, invoices, messaging</td>
                    <td className="border border-gray-300 p-2">/client</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8 page-break-before">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              3. Caregiver Portal Requirements
            </h2>
            
            <h3 className="font-semibold mt-4 mb-2">3.1 Authentication & Profile</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Email registration with verification</li>
              <li>Secure login with session management</li>
              <li>Profile management with photo upload</li>
              <li>Personal information and emergency contacts</li>
              <li>Password reset functionality</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">3.2 GPS Time Tracking</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>GPS capture on clock in with geofence validation</li>
              <li>GPS capture on clock out with location verification</li>
              <li>Configurable geofence radius per client (50m - 500m)</li>
              <li>Distance calculation using Haversine formula</li>
              <li>Device and accuracy information capture</li>
              <li>Violation flagging for admin review</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">3.3 Certification & Training</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Upload and manage certifications (CNA, HHA, CPR, First Aid)</li>
              <li>Expiration date tracking with automated alerts (30, 14, 7 days)</li>
              <li>View assigned training modules</li>
              <li>Training completion tracking</li>
              <li>Document upload (ID, licenses, background checks)</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">3.4 Daily Care Logs</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Submit daily care documentation</li>
              <li>ADL (Activities of Daily Living) checklists</li>
              <li>Medication administration logging</li>
              <li>Client condition notes</li>
              <li>Linked to time entries and specific clients</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">3.5 Schedule & Availability</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>View assigned shifts and schedule</li>
              <li>Set availability calendar</li>
              <li>Shift swap requests (optional)</li>
              <li>View assigned clients with care plans</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">3.6 Additional Features</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Earnings dashboard with hours and pay estimates</li>
              <li>Mileage tracking (optional)</li>
              <li>Expense reimbursement requests (optional)</li>
              <li>Secure messaging with admin and clients</li>
              <li>Push notifications for reminders and messages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              4. Client/Family Portal Requirements
            </h2>
            
            <h3 className="font-semibold mt-4 mb-2">4.1 Account Management</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Email registration with verification</li>
              <li>Linked to client intake records</li>
              <li>Family sub-accounts (multiple family members)</li>
              <li>Emergency contact management</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">4.2 Care Visibility</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>View assigned caregivers with profiles and certifications</li>
              <li>Daily care log viewing</li>
              <li>Care plan access</li>
              <li>Medication schedules (optional)</li>
              <li>Appointment calendar</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">4.3 Billing & Payments</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>View current and past invoices</li>
              <li>Online payment via Stripe</li>
              <li>Payment history and receipts</li>
              <li>Multiple payment method management</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">4.4 Communication</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Secure messaging with caregivers and admin</li>
              <li>Rate and review caregivers (optional)</li>
              <li>Notification preferences (email, SMS, push)</li>
            </ul>
          </section>

          <section className="mb-8 page-break-before">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              5. Admin Dashboard Requirements
            </h2>
            
            <h3 className="font-semibold mt-4 mb-2">5.1 Caregiver Management</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>View all caregivers with status and certifications</li>
              <li>Assign caregivers to clients with schedule and rates</li>
              <li>Track certification expirations</li>
              <li>Assign and track training completion</li>
              <li>Performance reviews and ratings</li>
              <li>Real-time location map during active shifts</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">5.2 Client Management</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>View all clients with care status</li>
              <li>Manage service locations with GPS coordinates</li>
              <li>Configure geofence radius per client</li>
              <li>View care history and logs</li>
              <li>Manage care plans and documents</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">5.3 Scheduling</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Visual shift calendar (week/month view)</li>
              <li>Drag-and-drop shift assignment</li>
              <li>Recurring shift templates</li>
              <li>Caregiver availability view</li>
              <li>Scheduling conflict detection</li>
              <li>Overtime alerts (approaching 40 hours)</li>
              <li>Open shift posting and approval</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">5.4 Time Entry Management</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Review and approve time entries</li>
              <li>Geofence violation review and override</li>
              <li>Edit time entries when needed</li>
              <li>Audit trail for all modifications</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">5.5 Invoicing</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Generate invoices from approved time entries</li>
              <li>Automatic rate calculation from assignments</li>
              <li>Invoice status tracking (draft, sent, paid, overdue)</li>
              <li>Batch invoice creation</li>
              <li>PDF generation and email delivery</li>
              <li>Payment tracking and reconciliation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              6. Notification System Requirements
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-muted print:bg-gray-200">
                    <th className="border border-gray-300 p-2 text-left">Notification Type</th>
                    <th className="border border-gray-300 p-2 text-left">Channels</th>
                    <th className="border border-gray-300 p-2 text-left">Recipients</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">Shift Reminder (24hr, 1hr)</td>
                    <td className="border border-gray-300 p-2">Email, SMS, Push</td>
                    <td className="border border-gray-300 p-2">Caregiver</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2">Clock-in Reminder</td>
                    <td className="border border-gray-300 p-2">SMS, Push</td>
                    <td className="border border-gray-300 p-2">Caregiver</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Certification Expiration (30, 14, 7 days)</td>
                    <td className="border border-gray-300 p-2">Email, Push</td>
                    <td className="border border-gray-300 p-2">Caregiver, Admin</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2">Training Due</td>
                    <td className="border border-gray-300 p-2">Email, Push</td>
                    <td className="border border-gray-300 p-2">Caregiver</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">Geofence Violation</td>
                    <td className="border border-gray-300 p-2">Email, Push</td>
                    <td className="border border-gray-300 p-2">Admin</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2">Invoice Due</td>
                    <td className="border border-gray-300 p-2">Email, SMS</td>
                    <td className="border border-gray-300 p-2">Client</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">New Message</td>
                    <td className="border border-gray-300 p-2">Push</td>
                    <td className="border border-gray-300 p-2">All Users</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2">Overtime Warning</td>
                    <td className="border border-gray-300 p-2">Email, Push</td>
                    <td className="border border-gray-300 p-2">Admin, Caregiver</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8 page-break-before">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              7. Analytics & Reporting Requirements
            </h2>
            
            <h3 className="font-semibold mt-4 mb-2">7.1 Dashboard Metrics</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Total hours worked (by period, caregiver, client)</li>
              <li>Revenue tracking (invoiced, paid, outstanding)</li>
              <li>Caregiver performance (on-time %, hours, ratings)</li>
              <li>Geofence compliance rate</li>
              <li>Certification compliance status</li>
              <li>Shift fill rate</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">7.2 Reports</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Payroll export (CSV/Excel)</li>
              <li>Invoice batch export</li>
              <li>Care log summaries per client</li>
              <li>Compliance reports</li>
              <li>Time entry reports</li>
              <li>Caregiver utilization reports</li>
              <li>Custom date range filtering</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              8. Compliance & Security Requirements
            </h2>
            
            <h3 className="font-semibold mt-4 mb-2">8.1 HIPAA Compliance</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Audit logs for all PHI access</li>
              <li>Role-based access control</li>
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure session management</li>
              <li>Password requirements and hashing</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">8.2 Documentation</h3>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
              <li>Electronic signature capture</li>
              <li>Document expiration tracking</li>
              <li>Care plan acknowledgments</li>
              <li>Policy acknowledgment tracking</li>
              <li>Incident/accident reporting</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">8.3 Audit Trail</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>All user actions logged</li>
              <li>Time entry modifications tracked</li>
              <li>Login/logout events</li>
              <li>Data access logs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              9. Technical Integrations
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-muted print:bg-gray-200">
                    <th className="border border-gray-300 p-2 text-left">Service</th>
                    <th className="border border-gray-300 p-2 text-left">Purpose</th>
                    <th className="border border-gray-300 p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">Resend</td>
                    <td className="border border-gray-300 p-2">Email notifications and invoices</td>
                    <td className="border border-gray-300 p-2 text-green-600">Configured</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">Twilio</td>
                    <td className="border border-gray-300 p-2">SMS notifications</td>
                    <td className="border border-gray-300 p-2 text-amber-600">Needs Setup</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">Stripe</td>
                    <td className="border border-gray-300 p-2">Payment processing</td>
                    <td className="border border-gray-300 p-2 text-amber-600">Needs Setup</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">Google Maps API</td>
                    <td className="border border-gray-300 p-2">Geocoding and map display</td>
                    <td className="border border-gray-300 p-2 text-green-600">Configured</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">Web Push API</td>
                    <td className="border border-gray-300 p-2">Browser push notifications</td>
                    <td className="border border-gray-300 p-2 text-blue-600">Built-in</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8 page-break-before">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              10. Database Schema Overview
            </h2>
            <p className="mb-4">The system requires the following database tables:</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Authentication & Users</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>caregiver_accounts</li>
                  <li>client_accounts</li>
                  <li>family_members</li>
                  <li>roles</li>
                  <li>permissions</li>
                  <li>role_permissions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Core Entities</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>client_service_locations</li>
                  <li>caregiver_client_assignments</li>
                  <li>caregiver_certifications</li>
                  <li>caregiver_documents</li>
                  <li>caregiver_availability</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Time & Scheduling</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>time_entries</li>
                  <li>location_updates</li>
                  <li>daily_care_logs</li>
                  <li>shifts</li>
                  <li>shift_templates</li>
                  <li>shift_swap_requests</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Training & Compliance</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>trainings</li>
                  <li>training_assignments</li>
                  <li>incidents</li>
                  <li>audit_logs</li>
                  <li>documents</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Billing</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>invoices</li>
                  <li>invoice_line_items</li>
                  <li>payments</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Communication</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>message_threads</li>
                  <li>messages</li>
                  <li>message_attachments</li>
                  <li>notification_preferences</li>
                  <li>notifications</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              11. Implementation Phases
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-muted print:bg-gray-200">
                    <th className="border border-gray-300 p-2 text-left">Phase</th>
                    <th className="border border-gray-300 p-2 text-left">Features</th>
                    <th className="border border-gray-300 p-2 text-left">Est. Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">1. Foundation</td>
                    <td className="border border-gray-300 p-2">Database, authentication, role-based access</td>
                    <td className="border border-gray-300 p-2">2 weeks</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">2. Caregiver Core</td>
                    <td className="border border-gray-300 p-2">Dashboard, profile, certifications, documents</td>
                    <td className="border border-gray-300 p-2">2 weeks</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">3. Client Core</td>
                    <td className="border border-gray-300 p-2">Dashboard, family accounts, caregiver viewing</td>
                    <td className="border border-gray-300 p-2">1-2 weeks</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">4. GPS Time Tracking</td>
                    <td className="border border-gray-300 p-2">Clock in/out, geofencing, admin approval</td>
                    <td className="border border-gray-300 p-2">2 weeks</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">5. Scheduling</td>
                    <td className="border border-gray-300 p-2">Calendar, shifts, availability, conflicts</td>
                    <td className="border border-gray-300 p-2">2 weeks</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">6. Daily Logs</td>
                    <td className="border border-gray-300 p-2">Care logs linked to shifts, admin review</td>
                    <td className="border border-gray-300 p-2">1 week</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">7. Notifications</td>
                    <td className="border border-gray-300 p-2">Email, SMS, push, preferences</td>
                    <td className="border border-gray-300 p-2">1-2 weeks</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">8. Invoicing</td>
                    <td className="border border-gray-300 p-2">Invoice generation, Stripe, payments</td>
                    <td className="border border-gray-300 p-2">2 weeks</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">9. Analytics</td>
                    <td className="border border-gray-300 p-2">Dashboard, metrics, reports, exports</td>
                    <td className="border border-gray-300 p-2">1-2 weeks</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">10. Messaging</td>
                    <td className="border border-gray-300 p-2">Threads, attachments, read receipts</td>
                    <td className="border border-gray-300 p-2">1-2 weeks</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-medium">11. Compliance</td>
                    <td className="border border-gray-300 p-2">Training, incidents, audit logs</td>
                    <td className="border border-gray-300 p-2">1-2 weeks</td>
                  </tr>
                  <tr className="bg-muted/30 print:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-medium">12. Polish</td>
                    <td className="border border-gray-300 p-2">Testing, optimization, documentation</td>
                    <td className="border border-gray-300 p-2">1 week</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 font-semibold">Total Estimated Timeline: 16-20 weeks</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary print:text-black border-b pb-2">
              12. Summary Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="print:border print:border-gray-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">120+</p>
                </CardContent>
              </Card>
              <Card className="print:border print:border-gray-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Database Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">35+</p>
                </CardContent>
              </Card>
              <Card className="print:border print:border-gray-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">User Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">5</p>
                </CardContent>
              </Card>
              <Card className="print:border print:border-gray-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Build Phases</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">12</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="mt-12 pt-6 border-t-2 border-primary print:border-black text-center text-sm text-muted-foreground print:text-gray-500">
            <p className="font-semibold text-foreground print:text-black mb-2">
              Private InHome CareGiver
            </p>
            <p>Massachusetts In-Home Care Platform</p>
            <p className="mt-2">
              Document generated: {new Date().toLocaleDateString()} | Version 1.0
            </p>
            <p className="mt-4">
              For questions, contact: info@privateinhomecaregiver.com | (617) 686-0595
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 0.75in;
            size: letter;
          }
          .page-break-before {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
