import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface IntakeForm {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dateOfBirth: string;
  caseRecordNo: string;
  formData: any;
  agreedToTerms?: string;
  agreedToPolicy?: string;
  agreementTimestamp?: string;
  createdAt: string;
}

export default function IntakeFormsManagement() {
  const [selectedForm, setSelectedForm] = useState<IntakeForm | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: forms = [], isLoading } = useQuery<IntakeForm[]>({
    queryKey: ["/api/admin/intake-forms"],
  });

  const handleViewForm = (form: IntakeForm) => {
    setSelectedForm(form);
    setViewDialogOpen(true);
  };

  const handleDownloadForm = (form: IntakeForm) => {
    // Create text content for download
    const content = `
MDS-HC v2.0 INTAKE ASSESSMENT FORM
=====================================

CLIENT INFORMATION
------------------
Name: ${form.clientName}
Case Record #: ${form.caseRecordNo}
Date of Birth: ${form.dateOfBirth}
Email: ${form.clientEmail}
Phone: ${form.clientPhone}
Submitted: ${new Date(form.createdAt).toLocaleString()}

${form.formData?.caregiverSignature ? `
CAREGIVER SIGNATURE
-------------------
Signature: ${form.formData.caregiverSignature.signature}
Title: ${form.formData.caregiverSignature.title}
Date: ${form.formData.caregiverSignature.date}
` : ''}

ASSESSMENT DATA
---------------
${JSON.stringify(form.formData, null, 2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intake-${form.caseRecordNo}-${new Date(form.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Intake Forms (MDS-HC v2.0)
          </CardTitle>
          <CardDescription>
            View and manage submitted intake assessment forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No intake forms submitted yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case #</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Caregiver</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id} data-testid={`row-intake-${form.id}`}>
                      <TableCell className="font-medium">{form.caseRecordNo}</TableCell>
                      <TableCell>{form.clientName}</TableCell>
                      <TableCell>{form.dateOfBirth}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{form.clientEmail}</div>
                          <div className="text-muted-foreground">{form.clientPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(form.createdAt).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {new Date(form.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {form.formData?.caregiverSignature ? (
                          <div className="text-sm">
                            <div className="font-medium">{form.formData.caregiverSignature.signature}</div>
                            <div className="text-muted-foreground">{form.formData.caregiverSignature.title}</div>
                            <div className="text-xs text-muted-foreground">{form.formData.caregiverSignature.date}</div>
                          </div>
                        ) : (
                          <Badge variant="secondary">No signature</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewForm(form)}
                            data-testid={`button-view-${form.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadForm(form)}
                            data-testid={`button-download-${form.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Intake Form Details</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Client Information</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {selectedForm.clientName}</div>
                    <div><strong>Case #:</strong> {selectedForm.caseRecordNo}</div>
                    <div><strong>DOB:</strong> {selectedForm.dateOfBirth}</div>
                    <div><strong>Email:</strong> {selectedForm.clientEmail}</div>
                    <div><strong>Phone:</strong> {selectedForm.clientPhone}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Submission Info</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>Submitted:</strong> {new Date(selectedForm.createdAt).toLocaleString()}</div>
                    {selectedForm.agreedToTerms === "yes" && selectedForm.agreedToPolicy === "yes" && selectedForm.agreementTimestamp && (
                      <div><strong>Agreement Accepted:</strong> {new Date(selectedForm.agreementTimestamp).toLocaleString()}</div>
                    )}
                    {selectedForm.formData?.caregiverSignature && (
                      <>
                        <div><strong>Caregiver:</strong> {selectedForm.formData.caregiverSignature.signature}</div>
                        <div><strong>Title:</strong> {selectedForm.formData.caregiverSignature.title}</div>
                        <div><strong>Signed:</strong> {selectedForm.formData.caregiverSignature.date}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Assessment Data</h3>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(selectedForm.formData, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadForm(selectedForm)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
