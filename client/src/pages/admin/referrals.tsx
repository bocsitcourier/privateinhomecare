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
import PrintableFormDialog, { FormSection, FormField, FormFieldGrid } from "@/components/PrintableFormDialog";
import { useState } from "react";
import { format } from "date-fns";
import { Mail, Phone, Calendar, CheckCircle, Clock, XCircle, Gift, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Referral = {
  id: string;
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
  status: string;
  incentiveAwarded: boolean;
  createdAt: string;
  updatedAt?: string;
};

export default function ReferralsPage() {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const { toast } = useToast();

  const { data: referrals, isLoading } = useQuery<Referral[]>({
    queryKey: ["/api/admin/referrals"],
  });

  const updateReferralMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/admin/referrals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/referrals"] });
      toast({
        title: "Success",
        description: "Referral updated successfully.",
      });
      setSelectedReferral(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update referral.",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      contacted: { variant: "default", icon: Phone },
      converted: { variant: "secondary", icon: CheckCircle },
      closed: { variant: "destructive", icon: XCircle },
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
    total: referrals?.length || 0,
    pending: referrals?.filter((r) => r.status === "pending").length || 0,
    contacted: referrals?.filter((r) => r.status === "contacted").length || 0,
    converted: referrals?.filter((r) => r.status === "converted").length || 0,
    incentivesAwarded: referrals?.filter((r) => r.incentiveAwarded).length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground mt-2">
            Manage client referrals and track incentive rewards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" data-testid="stat-total">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600" data-testid="stat-pending">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contacted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600" data-testid="stat-contacted">{stats.contacted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Converted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600" data-testid="stat-converted">{stats.converted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Incentives Awarded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-600" />
                <p className="text-2xl font-bold text-purple-600" data-testid="stat-incentives">{stats.incentivesAwarded}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {!referrals || referrals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No referrals yet. They will appear here when clients submit the referral form.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred Person</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Incentive</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id} data-testid={`referral-row-${referral.id}`}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{referral.referrerName}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${referral.referrerEmail}`} className="hover:underline">
                                  {referral.referrerEmail}
                                </a>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <a href={`tel:${referral.referrerPhone}`} className="hover:underline">
                                  {referral.referrerPhone}
                                </a>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{referral.referredName}</p>
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <a href={`tel:${referral.referredPhone}`} className="hover:underline">
                                  {referral.referredPhone}
                                </a>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{referral.relationshipToReferred}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{referral.referredLocation}</TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell>
                          {referral.incentiveAwarded ? (
                            <Badge variant="secondary" className="gap-1">
                              <Gift className="h-3 w-3" />
                              Awarded
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(referral.createdAt), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReferral(referral)}
                            data-testid={`button-view-${referral.id}`}
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

      {/* Referral Detail Dialog */}
      <PrintableFormDialog
        open={!!selectedReferral}
        onOpenChange={() => setSelectedReferral(null)}
        title="Referral Submission"
        subtitle={selectedReferral ? `Referred by ${selectedReferral.referrerName}` : undefined}
        formId={selectedReferral?.id}
      >
        {selectedReferral && (
          <div className="space-y-6">
            <FormSection title="Referrer Information">
              <FormFieldGrid>
                <FormField label="Full Name" value={selectedReferral.referrerName} />
                <FormField
                  label="Email Address"
                  value={
                    <a href={`mailto:${selectedReferral.referrerEmail}`} className="text-primary hover:underline">
                      {selectedReferral.referrerEmail}
                    </a>
                  }
                />
                <FormField
                  label="Phone Number"
                  value={
                    <a href={`tel:${selectedReferral.referrerPhone}`} className="text-primary hover:underline">
                      {selectedReferral.referrerPhone}
                    </a>
                  }
                />
                <FormField
                  label="Relationship to Referred"
                  value={<Badge variant="outline">{selectedReferral.relationshipToReferred}</Badge>}
                />
              </FormFieldGrid>
            </FormSection>

            <FormSection title="Referred Person Information">
              <FormFieldGrid>
                <FormField label="Full Name" value={selectedReferral.referredName} />
                <FormField
                  label="Phone Number"
                  value={
                    <a href={`tel:${selectedReferral.referredPhone}`} className="text-primary hover:underline">
                      {selectedReferral.referredPhone}
                    </a>
                  }
                />
                <FormField
                  label="Email Address"
                  value={
                    selectedReferral.referredEmail ? (
                      <a href={`mailto:${selectedReferral.referredEmail}`} className="text-primary hover:underline">
                        {selectedReferral.referredEmail}
                      </a>
                    ) : undefined
                  }
                />
                <FormField label="Location" value={selectedReferral.referredLocation} />
              </FormFieldGrid>
              <div className="mt-4">
                <FormField label="Primary Need for Care" value={selectedReferral.primaryNeedForCare} />
              </div>
            </FormSection>

            {selectedReferral.additionalInfo && (
              <FormSection title="Additional Information">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">{selectedReferral.additionalInfo}</p>
                </div>
              </FormSection>
            )}

            <FormSection title="Referral Tracking">
              <FormFieldGrid>
                <FormField label="Date Submitted" value={format(new Date(selectedReferral.createdAt), "PPpp")} />
                <FormField label="Current Status" value={getStatusBadge(selectedReferral.status)} />
                <FormField
                  label="Incentive Status"
                  value={
                    selectedReferral.incentiveAwarded ? (
                      <Badge variant="secondary" className="gap-1">
                        <Gift className="h-3 w-3" />
                        Awarded
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )
                  }
                />
              </FormFieldGrid>
            </FormSection>

            <div className="print:hidden border-t pt-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["pending", "contacted", "converted", "closed"].map((status) => (
                    <Button
                      key={status}
                      variant={selectedReferral.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateReferralMutation.mutate({
                          id: selectedReferral.id,
                          data: { status },
                        })
                      }
                      disabled={updateReferralMutation.isPending}
                      data-testid={`button-status-${status}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Incentive Award</h3>
                <Button
                  variant={selectedReferral.incentiveAwarded ? "secondary" : "default"}
                  onClick={() =>
                    updateReferralMutation.mutate({
                      id: selectedReferral.id,
                      data: { incentiveAwarded: !selectedReferral.incentiveAwarded },
                    })
                  }
                  disabled={updateReferralMutation.isPending}
                  data-testid="button-toggle-incentive"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  {selectedReferral.incentiveAwarded ? "Remove Incentive" : "Award Incentive"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </PrintableFormDialog>
    </AdminLayout>
  );
}
