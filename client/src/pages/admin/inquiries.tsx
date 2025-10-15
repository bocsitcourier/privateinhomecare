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
import { Mail, Phone, MessageSquare, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service?: string;
  message?: string;
  status: string;
  agreedToTerms: string;
  agreedToPolicy: string;
  agreementTimestamp?: string;
  createdAt: string;
  updatedAt?: string;
};

export default function InquiriesPage() {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const { toast } = useToast();

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/inquiries/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({
        title: "Success",
        description: "Inquiry status updated successfully.",
      });
      setSelectedInquiry(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update inquiry status.",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      contacted: { variant: "default", icon: MessageSquare },
      resolved: { variant: "secondary", icon: CheckCircle },
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
    total: inquiries?.length || 0,
    pending: inquiries?.filter((i) => i.status === "pending").length || 0,
    contacted: inquiries?.filter((i) => i.status === "contacted").length || 0,
    resolved: inquiries?.filter((i) => i.status === "resolved").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Consultation Inquiries</h1>
          <p className="text-muted-foreground mt-2">
            Manage consultation form submissions and follow-ups
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Inquiries
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
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600" data-testid="stat-resolved">{stats.resolved}</p>
            </CardContent>
          </Card>
        </div>

        {/* Inquiries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {!inquiries || inquiries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No inquiries yet. They will appear here when users submit the consultation form.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry) => (
                      <TableRow key={inquiry.id} data-testid={`inquiry-row-${inquiry.id}`}>
                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <a href={`mailto:${inquiry.email}`} className="hover:underline">
                                {inquiry.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <a href={`tel:${inquiry.phone}`} className="hover:underline">
                                {inquiry.phone}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {inquiry.service || <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(inquiry.createdAt), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                            data-testid={`button-view-${inquiry.id}`}
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

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Review and manage this consultation request
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium" data-testid="detail-name">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="font-medium hover:underline"
                      data-testid="detail-email"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="font-medium hover:underline"
                      data-testid="detail-phone"
                    >
                      {selectedInquiry.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Interested</p>
                    <p className="font-medium" data-testid="detail-service">
                      {selectedInquiry.service || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedInquiry.message && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Message</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap" data-testid="detail-message">{selectedInquiry.message}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-3">
                <h3 className="font-semibold">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p data-testid="detail-created">{format(new Date(selectedInquiry.createdAt), "PPpp")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Status</p>
                    <div data-testid="detail-status">{getStatusBadge(selectedInquiry.status)}</div>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["pending", "contacted", "resolved", "closed"].map((status) => (
                    <Button
                      key={status}
                      variant={selectedInquiry.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: selectedInquiry.id,
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
