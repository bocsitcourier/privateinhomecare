import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Users, Clock, CheckCircle2, XCircle, DollarSign, Eye, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Referral } from "@shared/schema";

export default function ReferralsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [hoursCompleted, setHoursCompleted] = useState("");
  const { toast } = useToast();

  const { data: referrals = [], isLoading, refetch } = useQuery<Referral[]>({
    queryKey: ["/api/admin/referrals", statusFilter],
    enabled: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/referrals/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return await apiRequest("PATCH", `/api/admin/referrals/${id}/notes`, { notes });
    },
    onSuccess: () => {
      toast({ title: "Notes updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      setNotes("");
      refetch();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: async ({ id, hoursCompleted }: { id: string; hoursCompleted: string }) => {
      return await apiRequest("PATCH", `/api/admin/referrals/${id}/tracking`, { hoursCompleted });
    },
    onSuccess: () => {
      toast({ title: "Hours tracking updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      setHoursCompleted("");
      refetch();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const issueCreditMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/referrals/${id}/issue-credit`, {});
    },
    onSuccess: () => {
      toast({ 
        title: "Credit Issued", 
        description: "$300 service credit has been issued for this referral" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleViewDetails = (referral: Referral) => {
    setSelectedReferral(referral);
    setNotes(referral.notes || "");
    setHoursCompleted(referral.hoursCompleted || "0");
    setDetailsOpen(true);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleUpdateNotes = () => {
    if (selectedReferral && notes.trim()) {
      updateNotesMutation.mutate({ id: selectedReferral.id, notes: notes.trim() });
    }
  };

  const handleUpdateTracking = () => {
    if (selectedReferral && hoursCompleted.trim()) {
      updateTrackingMutation.mutate({ id: selectedReferral.id, hoursCompleted: hoursCompleted.trim() });
    }
  };

  const handleIssueCredit = (id: string) => {
    if (confirm("Are you sure you want to issue the $300 service credit for this referral? This action cannot be undone.")) {
      issueCreditMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      contacted: { variant: "secondary", icon: Users },
      converted: { variant: "default", icon: CheckCircle2 },
      credited: { variant: "default", icon: DollarSign },
      declined: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === "pending").length,
    contacted: referrals.filter(r => r.status === "contacted").length,
    converted: referrals.filter(r => r.status === "converted").length,
    credited: referrals.filter(r => r.status === "credited").length,
    totalCredits: referrals.filter(r => r.creditIssued === "yes").length * 300,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client Referrals Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage the "Refer a Friend" program and track $300 service credit eligibility
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Referrals</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Contacted</div>
            <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Converted</div>
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Credits Issued</div>
            <div className="text-2xl font-bold text-primary">{stats.credited}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total $ Value</div>
            <div className="text-2xl font-bold text-green-700">${stats.totalCredits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" data-testid="select-status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="credited">Credited</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="text-loading">Loading referrals...</div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-referrals">
              No referrals found
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <Card key={referral.id} data-testid={`card-referral-${referral.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg" data-testid={`text-referrer-name-${referral.id}`}>
                            {referral.referrerName}
                          </h3>
                          {getStatusBadge(referral.status)}
                          {referral.creditIssued === "yes" && (
                            <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              $300 Credit Issued
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Referring to:</span>{" "}
                            <span className="font-medium">{referral.referredName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>{" "}
                            <span className="font-medium">{referral.referredLocation}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tracking Code:</span>{" "}
                            <span className="font-mono font-medium">{referral.trackingCode}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Hours Completed:</span>{" "}
                            <span className="font-medium">{referral.hoursCompleted || "0"}/80</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Need:</span>{" "}
                            <span className="font-medium">{referral.primaryNeedForCare}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>{" "}
                            <span className="font-medium">
                              {format(new Date(referral.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        {referral.notes && (
                          <div className="mt-2 p-3 bg-muted rounded-md">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Admin Notes:</div>
                            <div className="text-sm">{referral.notes}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(referral)}
                          data-testid={`button-view-details-${referral.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {referral.status !== "credited" && referral.creditIssued !== "yes" && parseInt(referral.hoursCompleted || "0") >= 80 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleIssueCredit(referral.id)}
                            data-testid={`button-issue-credit-${referral.id}`}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Issue $300 Credit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Referral Details</DialogTitle>
            <DialogDescription>
              Complete information and management options for this referral
            </DialogDescription>
          </DialogHeader>

          {selectedReferral && (
            <div className="space-y-6">
              {/* Referrer Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Referrer Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{selectedReferral.referrerName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{selectedReferral.referrerEmail}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium">{selectedReferral.referrerPhone}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Relationship</div>
                    <div className="font-medium">{selectedReferral.relationshipToReferred}</div>
                  </div>
                </div>
              </div>

              {/* Referred Person Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Referred Person Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{selectedReferral.referredName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium">{selectedReferral.referredPhone}</div>
                  </div>
                  {selectedReferral.referredEmail && (
                    <div>
                      <div className="text-muted-foreground">Email</div>
                      <div className="font-medium">{selectedReferral.referredEmail}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Location</div>
                    <div className="font-medium">{selectedReferral.referredLocation}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground">Primary Need for Care</div>
                    <div className="font-medium">{selectedReferral.primaryNeedForCare}</div>
                  </div>
                  {selectedReferral.additionalInfo && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground">Additional Information</div>
                      <div className="font-medium mt-1 p-3 bg-muted rounded-md">
                        {selectedReferral.additionalInfo}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Information */}
              <div>
                <h3 className="font-semibold mb-3">Tracking & Status</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Tracking Code</div>
                    <div className="font-mono font-medium">{selectedReferral.trackingCode}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div>{getStatusBadge(selectedReferral.status)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Hours Completed</div>
                    <div className="font-medium">{selectedReferral.hoursCompleted || "0"} / 80</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Credit Issued</div>
                    <div className="font-medium">
                      {selectedReferral.creditIssued === "yes" ? (
                        <Badge variant="default" className="bg-green-600">Yes - $300</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </div>
                  </div>
                  {selectedReferral.creditIssuedDate && (
                    <div>
                      <div className="text-muted-foreground">Credit Issued Date</div>
                      <div className="font-medium">
                        {format(new Date(selectedReferral.creditIssuedDate), "MMM d, yyyy")}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Submitted</div>
                    <div className="font-medium">
                      {format(new Date(selectedReferral.createdAt), "MMM d, yyyy h:mm a")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement Compliance */}
              <div>
                <h3 className="font-semibold mb-3">Compliance & Agreements</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {selectedReferral.consentToContact === "yes" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>Consent to Contact Referred Person</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedReferral.acknowledgedCreditTerms === "yes" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>Acknowledged $300 Credit Terms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedReferral.acknowledgedComplianceTerms === "yes" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>Acknowledged Compliance Terms</span>
                  </div>
                  {selectedReferral.agreementTimestamp && (
                    <div className="text-muted-foreground mt-2">
                      Agreements accepted on {format(new Date(selectedReferral.agreementTimestamp), "MMM d, yyyy h:mm a")}
                    </div>
                  )}
                </div>
              </div>

              {/* Management Actions */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status-update">Update Status</Label>
                  <Select
                    value={selectedReferral.status}
                    onValueChange={(status) => handleUpdateStatus(selectedReferral.id, status)}
                  >
                    <SelectTrigger id="status-update" data-testid="select-status-update">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="credited">Credited</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hours-tracking">Hours Completed (0-80)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hours-tracking"
                      type="number"
                      min="0"
                      max="200"
                      value={hoursCompleted}
                      onChange={(e) => setHoursCompleted(e.target.value)}
                      placeholder="Enter hours completed"
                      data-testid="input-hours-completed"
                    />
                    <Button onClick={handleUpdateTracking} disabled={!hoursCompleted.trim()} data-testid="button-update-hours">
                      Update
                    </Button>
                  </div>
                  {parseInt(hoursCompleted || "0") >= 80 && selectedReferral.creditIssued !== "yes" && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>80 hours threshold reached! Ready to issue credit.</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes-update">Admin Notes</Label>
                  <Textarea
                    id="notes-update"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about this referral..."
                    rows={4}
                    data-testid="input-notes"
                  />
                  <Button onClick={handleUpdateNotes} disabled={!notes.trim()} className="mt-2" data-testid="button-update-notes">
                    Save Notes
                  </Button>
                </div>

                {selectedReferral.creditIssued !== "yes" && parseInt(selectedReferral.hoursCompleted || "0") >= 80 && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                          Ready to Issue $300 Service Credit
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          This referral has completed 80+ hours and is eligible for the $300 service credit.
                        </p>
                        <Button
                          onClick={() => handleIssueCredit(selectedReferral.id)}
                          className="mt-3 bg-green-600 hover:bg-green-700"
                          data-testid="button-issue-credit-dialog"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Issue $300 Credit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
