import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";
import { Mail, Phone, Calendar, CheckCircle, Clock, XCircle, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type JobApplication = {
  id: string;
  jobId?: string;
  positionInterested?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  backgroundScreeningConsent: string;
  certificationType?: string;
  drivingStatus?: string;
  availability?: string[];
  startDate?: string;
  yearsExperience?: number;
  specialSkills?: string[];
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
};

export default function ApplicationsPage() {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const { toast } = useToast();

  const { data: applications, isLoading } = useQuery<JobApplication[]>({
    queryKey: ["/api/admin/applications"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/applications/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({
        title: "Success",
        description: "Application status updated successfully.",
      });
      setSelectedApplication(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status.",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      reviewing: { variant: "default", icon: FileText },
      accepted: { variant: "secondary", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter((a) => a.status === "pending").length || 0,
    reviewing: applications?.filter((a) => a.status === "reviewing").length || 0,
    accepted: applications?.filter((a) => a.status === "accepted").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage caregiver job applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" data-testid="stat-total">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600" data-testid="stat-pending">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600" data-testid="stat-reviewing">{stats.reviewing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accepted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600" data-testid="stat-accepted">{stats.accepted}</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {!applications || applications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No applications yet. They will appear here when candidates submit job applications.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id} data-testid={`application-row-${application.id}`}>
                        <TableCell className="font-medium">{application.fullName}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <a href={`mailto:${application.email}`} className="hover:underline">
                                {application.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <a href={`tel:${application.phone}`} className="hover:underline">
                                {application.phone}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {application.positionInterested || (
                            <span className="text-muted-foreground">General Application</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {application.yearsExperience !== undefined ? (
                            `${application.yearsExperience} years`
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(application.createdAt), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                            data-testid={`button-view-${application.id}`}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete applicant information and resume
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium" data-testid="detail-name">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${selectedApplication.email}`}
                      className="font-medium hover:underline"
                      data-testid="detail-email"
                    >
                      {selectedApplication.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${selectedApplication.phone}`}
                      className="font-medium hover:underline"
                      data-testid="detail-phone"
                    >
                      {selectedApplication.phone}
                    </a>
                  </div>
                  {selectedApplication.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium" data-testid="detail-address">{selectedApplication.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Position Interested</p>
                    <p className="font-medium" data-testid="detail-position">
                      {selectedApplication.positionInterested || "General Application"}
                    </p>
                  </div>
                  {selectedApplication.yearsExperience !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Years of Experience</p>
                      <p className="font-medium" data-testid="detail-experience">
                        {selectedApplication.yearsExperience} years
                      </p>
                    </div>
                  )}
                  {selectedApplication.certificationType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Certification</p>
                      <p className="font-medium" data-testid="detail-certification">
                        {selectedApplication.certificationType}
                      </p>
                    </div>
                  )}
                  {selectedApplication.drivingStatus && (
                    <div>
                      <p className="text-sm text-muted-foreground">Driving Status</p>
                      <p className="font-medium" data-testid="detail-driving">
                        {selectedApplication.drivingStatus.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                  {selectedApplication.startDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Available Start Date</p>
                      <p className="font-medium" data-testid="detail-startdate">{selectedApplication.startDate}</p>
                    </div>
                  )}
                  {selectedApplication.backgroundScreeningConsent && (
                    <div>
                      <p className="text-sm text-muted-foreground">Background Check Consent</p>
                      <Badge variant="secondary" data-testid="detail-background">
                        {selectedApplication.backgroundScreeningConsent}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability & Skills */}
              {(selectedApplication.availability && selectedApplication.availability.length > 0) && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Availability</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.availability.map((day) => (
                      <Badge key={day} variant="outline" data-testid={`availability-${day}`}>
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(selectedApplication.specialSkills && selectedApplication.specialSkills.length > 0) && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Special Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.specialSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" data-testid={`skill-${skill}`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Cover Letter</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm" data-testid="detail-coverletter">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApplication.resumeUrl && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Resume</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    data-testid="button-download-resume"
                  >
                    <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </a>
                  </Button>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-3">
                <h3 className="font-semibold">Application Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p data-testid="detail-created">{format(new Date(selectedApplication.createdAt), "PPpp")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Status</p>
                    <div data-testid="detail-status">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["pending", "reviewing", "accepted", "rejected"].map((status) => (
                    <Button
                      key={status}
                      variant={selectedApplication.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: selectedApplication.id,
                          status,
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-status-${status}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
