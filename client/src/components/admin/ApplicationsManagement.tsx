import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { JobApplication } from "@shared/schema";

export default function ApplicationsManagement() {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: applications = [], isLoading } = useQuery<JobApplication[]>({
    queryKey: ["/api/admin/applications"],
  });

  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/jobs"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/applications/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Application status updated" });
    },
  });

  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleDownloadApplication = (application: JobApplication) => {
    const job = jobs.find((j: any) => j.id === application.jobId);
    const position = application.positionInterested || job?.title || "Unknown Position";
    
    const content = `
JOB APPLICATION FORM
====================

Position Applied For: ${position}
Application Date: ${new Date(application.createdAt).toLocaleString()}
Status: ${application.status}

PERSONAL INFORMATION
--------------------
Full Name: ${application.fullName}
Email: ${application.email}
Phone: ${application.phone}
Address: ${application.address || 'N/A'}

BACKGROUND SCREENING & CERTIFICATIONS
-----------------------------
Background Screening Consent: ${application.backgroundScreeningConsent || 'N/A'}
Certification Type: ${application.certificationType || 'N/A'}
Driving Status: ${application.drivingStatus || 'N/A'}

EXPERIENCE & AVAILABILITY
--------------------------
Years of Experience: ${application.yearsExperience || 'N/A'}
Availability: ${Array.isArray(application.availability) ? application.availability.join(', ') : 'N/A'}
Preferred Start Date: ${application.startDate || 'N/A'}
Special Skills: ${Array.isArray(application.specialSkills) ? application.specialSkills.join(', ') : 'N/A'}

BEHAVIORAL SCREENING RESPONSES
-------------------------------
1. Motivation:
${application.motivation || 'N/A'}

2. Adaptability:
${application.adaptability || 'N/A'}

3. Conflict Handling:
${application.conflictHandling || 'N/A'}

4. Safety Achievement:
${application.safetyAchievement || 'N/A'}

5. Experience Types:
${application.experienceTypes || 'N/A'}

ADDITIONAL INFORMATION
----------------------
Resume: ${application.resumeUrl || 'Not provided'}
Cover Letter:
${application.coverLetter || 'Not provided'}

Consent to Background Check: ${application.consent}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `application-${application.fullName.replace(/\s+/g, '-')}-${new Date(application.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-chart-4';
      case 'reviewing': return 'bg-chart-1';
      case 'accepted': return 'bg-chart-3';
      case 'rejected': return 'bg-muted';
      default: return 'bg-secondary';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const getJobTitle = (jobId: string | null) => {
    if (!jobId) return 'General Application';
    const job = jobs.find((j: any) => j.id === jobId);
    return job?.title || 'Unknown Job';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Job Applications</h2>
          <p className="text-muted-foreground">Review and manage caregiver applications</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No applications found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.fullName}</TableCell>
                    <TableCell>
                      {application.positionInterested || getJobTitle(application.jobId)}
                    </TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>{application.phone}</TableCell>
                    <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        value={application.status}
                        onValueChange={(status) =>
                          updateStatusMutation.mutate({ id: application.id, status })
                        }
                      >
                        <SelectTrigger className="w-32" data-testid={`select-status-${application.id}`}>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewApplication(application)}
                          data-testid={`button-view-${application.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadApplication(application)}
                          data-testid={`button-download-${application.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Full Name:</span>
                      <p className="font-medium">{selectedApplication.fullName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <p className="font-medium">{selectedApplication.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Application Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Position:</span>
                      <p className="font-medium">
                        {selectedApplication.positionInterested || getJobTitle(selectedApplication.jobId)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(selectedApplication.status)}>
                        {selectedApplication.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Applied:</span>
                      <p className="font-medium">
                        {new Date(selectedApplication.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {selectedApplication.agreedToTerms === "yes" && selectedApplication.agreedToPolicy === "yes" && selectedApplication.agreementTimestamp && (
                      <div>
                        <span className="text-muted-foreground">Agreement Accepted:</span>
                        <p className="font-medium text-xs">
                          {new Date(selectedApplication.agreementTimestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Qualifications</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Background Screening Consent:</span>
                    <p className="font-medium">{selectedApplication.backgroundScreeningConsent || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Certification:</span>
                    <p className="font-medium">{selectedApplication.certificationType || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Driving Status:</span>
                    <p className="font-medium">{selectedApplication.drivingStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Years Experience:</span>
                    <p className="font-medium">{selectedApplication.yearsExperience || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedApplication.motivation && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Behavioral Screening</h3>
                  <div className="space-y-3 text-sm">
                    {selectedApplication.motivation && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-muted-foreground text-xs mb-1">Motivation:</p>
                        <p>{selectedApplication.motivation}</p>
                      </div>
                    )}
                    {selectedApplication.adaptability && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-muted-foreground text-xs mb-1">Adaptability:</p>
                        <p>{selectedApplication.adaptability}</p>
                      </div>
                    )}
                    {selectedApplication.conflictHandling && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-muted-foreground text-xs mb-1">Conflict Handling:</p>
                        <p>{selectedApplication.conflictHandling}</p>
                      </div>
                    )}
                    {selectedApplication.safetyAchievement && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-muted-foreground text-xs mb-1">Safety Achievement:</p>
                        <p>{selectedApplication.safetyAchievement}</p>
                      </div>
                    )}
                    {selectedApplication.experienceTypes && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-muted-foreground text-xs mb-1">Experience Types:</p>
                        <p>{selectedApplication.experienceTypes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApplication.coverLetter && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Cover Letter</h3>
                  <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}

              {selectedApplication.resumeUrl && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Resume</h3>
                  <a
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
