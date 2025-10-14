import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface HipaaAcknowledgment {
  id: string;
  clientFullName: string;
  clientDateOfBirth: string;
  acknowledgmentReceived: string;
  consentProvided: string;
  clientSignature: string;
  clientPrintedName: string;
  clientSignatureDate: string;
  representativeRelationship?: string;
  representativeSignature?: string;
  representativePrintedName?: string;
  representativeSignatureDate?: string;
  createdAt: string;
}

export default function HipaaAcknowledgmentsManagement() {
  const [selectedAcknowledgment, setSelectedAcknowledgment] = useState<HipaaAcknowledgment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: acknowledgments = [], isLoading } = useQuery<HipaaAcknowledgment[]>({
    queryKey: ["/api/admin/hipaa-acknowledgments"],
  });

  const handleViewAcknowledgment = (acknowledgment: HipaaAcknowledgment) => {
    setSelectedAcknowledgment(acknowledgment);
    setViewDialogOpen(true);
  };

  const handleDownloadAcknowledgment = (acknowledgment: HipaaAcknowledgment) => {
    const content = `
HIPAA PRIVACY ACKNOWLEDGMENT FORM
==================================

CLIENT INFORMATION
------------------
Full Name: ${acknowledgment.clientFullName}
Date of Birth: ${acknowledgment.clientDateOfBirth}
Submitted: ${new Date(acknowledgment.createdAt).toLocaleString()}

ACKNOWLEDGMENT & CONSENT
------------------------
Acknowledgment Received: ${acknowledgment.acknowledgmentReceived}
Consent Provided: ${acknowledgment.consentProvided}

CLIENT SIGNATURE
----------------
Signature: ${acknowledgment.clientSignature}
Printed Name: ${acknowledgment.clientPrintedName}
Date: ${acknowledgment.clientSignatureDate}

${acknowledgment.representativeSignature ? `
REPRESENTATIVE SIGNATURE
-----------------------
Relationship: ${acknowledgment.representativeRelationship || 'N/A'}
Signature: ${acknowledgment.representativeSignature}
Printed Name: ${acknowledgment.representativePrintedName || 'N/A'}
Date: ${acknowledgment.representativeSignatureDate || 'N/A'}
` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hipaa-acknowledgment-${acknowledgment.clientFullName.replace(/\s+/g, '-')}-${new Date(acknowledgment.createdAt).toISOString().split('T')[0]}.txt`;
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
            HIPAA Privacy Acknowledgments
          </CardTitle>
          <CardDescription>
            View and manage submitted HIPAA privacy acknowledgment forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {acknowledgments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No HIPAA acknowledgments submitted yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Acknowledgment</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Representative</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acknowledgments.map((acknowledgment) => (
                    <TableRow key={acknowledgment.id} data-testid={`row-hipaa-${acknowledgment.id}`}>
                      <TableCell className="font-medium" data-testid={`text-client-name-${acknowledgment.id}`}>{acknowledgment.clientFullName}</TableCell>
                      <TableCell data-testid={`text-dob-${acknowledgment.id}`}>{acknowledgment.clientDateOfBirth}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={acknowledgment.acknowledgmentReceived === 'yes' ? 'default' : 'secondary'}
                          data-testid={`badge-acknowledgment-${acknowledgment.id}`}
                        >
                          {acknowledgment.acknowledgmentReceived}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={acknowledgment.consentProvided === 'yes' ? 'default' : 'secondary'}
                          data-testid={`badge-consent-${acknowledgment.id}`}
                        >
                          {acknowledgment.consentProvided}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-submitted-${acknowledgment.id}`}>
                        {new Date(acknowledgment.createdAt).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {new Date(acknowledgment.createdAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-representative-${acknowledgment.id}`}>
                        {acknowledgment.representativeSignature ? (
                          <div className="text-sm">
                            <div className="font-medium">{acknowledgment.representativeSignature}</div>
                            <div className="text-muted-foreground">{acknowledgment.representativeRelationship || 'N/A'}</div>
                          </div>
                        ) : (
                          <Badge variant="secondary" data-testid={`badge-representative-none-${acknowledgment.id}`}>No representative</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAcknowledgment(acknowledgment)}
                            data-testid={`button-view-${acknowledgment.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAcknowledgment(acknowledgment)}
                            data-testid={`button-download-${acknowledgment.id}`}
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
            <DialogTitle>HIPAA Privacy Acknowledgment Details</DialogTitle>
          </DialogHeader>
          {selectedAcknowledgment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Client Information</h3>
                  <div className="space-y-1 text-sm">
                    <div data-testid="text-modal-client-name"><strong>Name:</strong> {selectedAcknowledgment.clientFullName}</div>
                    <div data-testid="text-modal-dob"><strong>DOB:</strong> {selectedAcknowledgment.clientDateOfBirth}</div>
                    <div data-testid="text-modal-submitted"><strong>Submitted:</strong> {new Date(selectedAcknowledgment.createdAt).toLocaleString()}</div>
                    {selectedAcknowledgment.agreedToTerms === "yes" && selectedAcknowledgment.agreedToPolicy === "yes" && selectedAcknowledgment.agreementTimestamp && (
                      <div data-testid="text-modal-agreement-accepted"><strong>Agreement Accepted:</strong> {new Date(selectedAcknowledgment.agreementTimestamp).toLocaleString()}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Acknowledgment & Consent</h3>
                  <div className="space-y-1 text-sm">
                    <div data-testid="text-modal-acknowledgment"><strong>Acknowledgment Received:</strong> {selectedAcknowledgment.acknowledgmentReceived}</div>
                    <div data-testid="text-modal-consent"><strong>Consent Provided:</strong> {selectedAcknowledgment.consentProvided}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Client Signature</h3>
                  <div className="space-y-1 text-sm">
                    <div data-testid="text-modal-client-signature"><strong>Signature:</strong> {selectedAcknowledgment.clientSignature}</div>
                    <div data-testid="text-modal-client-printed-name"><strong>Printed Name:</strong> {selectedAcknowledgment.clientPrintedName}</div>
                    <div data-testid="text-modal-client-signature-date"><strong>Date:</strong> {selectedAcknowledgment.clientSignatureDate}</div>
                  </div>
                </div>
                {selectedAcknowledgment.representativeSignature && (
                  <div>
                    <h3 className="font-semibold mb-2">Representative Signature</h3>
                    <div className="space-y-1 text-sm">
                      <div data-testid="text-modal-rep-relationship"><strong>Relationship:</strong> {selectedAcknowledgment.representativeRelationship || 'N/A'}</div>
                      <div data-testid="text-modal-rep-signature"><strong>Signature:</strong> {selectedAcknowledgment.representativeSignature}</div>
                      <div data-testid="text-modal-rep-printed-name"><strong>Printed Name:</strong> {selectedAcknowledgment.representativePrintedName || 'N/A'}</div>
                      <div data-testid="text-modal-rep-signature-date"><strong>Date:</strong> {selectedAcknowledgment.representativeSignatureDate || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                  data-testid="button-close-modal"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => handleDownloadAcknowledgment(selectedAcknowledgment)}
                  data-testid="button-download-modal"
                >
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
