import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkles, Clock, CheckCircle2, XCircle, Eye, Trash2, Phone, Mail, MapPin, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { ConciergeRequest } from "@shared/schema";

export default function ConciergeRequestsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ConciergeRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const queryUrl = statusFilter === "all" 
    ? "/api/admin/concierge-requests" 
    : `/api/admin/concierge-requests?status=${statusFilter}`;
  
  const { data: requests = [], isLoading, refetch } = useQuery<ConciergeRequest[]>({
    queryKey: ["/api/admin/concierge-requests", statusFilter],
    queryFn: async () => {
      const response = await fetch(queryUrl, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch concierge requests");
      return response.json();
    },
    enabled: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/concierge-requests/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/concierge-requests"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ConciergeRequest> }) => {
      return await apiRequest("PATCH", `/api/admin/concierge-requests/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Request updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/concierge-requests"] });
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/concierge-requests/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Request deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/concierge-requests"] });
      setDetailsOpen(false);
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleViewDetails = (request: ConciergeRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || "");
    setDetailsOpen(true);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleUpdateNotes = () => {
    if (selectedRequest && notes.trim()) {
      updateRequestMutation.mutate({ id: selectedRequest.id, data: { notes: notes.trim() } });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this concierge request? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: typeof Clock }> = {
      pending: { variant: "outline", icon: Clock },
      contacted: { variant: "secondary", icon: Phone },
      scheduled: { variant: "default", icon: Calendar },
      completed: { variant: "default", icon: CheckCircle2 },
      cancelled: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredRequests = statusFilter === "all" 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    contacted: requests.filter(r => r.status === "contacted").length,
    scheduled: requests.filter(r => r.status === "scheduled").length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="heading-concierge-requests">Concierge Service Requests</h2>
          <p className="text-muted-foreground">Manage senior concierge service inquiries</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-muted-foreground">Total</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div><div className="text-sm text-muted-foreground">Pending</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{stats.contacted}</div><div className="text-sm text-muted-foreground">Contacted</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{stats.scheduled}</div><div className="text-sm text-muted-foreground">Scheduled</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.completed}</div><div className="text-sm text-muted-foreground">Completed</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Concierge Requests
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No concierge requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Senior Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} data-testid={`row-concierge-${request.id}`}>
                      <TableCell className="whitespace-nowrap">
                        {request.createdAt ? format(new Date(request.createdAt), "MMM d, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">{request.seniorName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{request.contactName}</div>
                          <div className="text-muted-foreground">{request.contactEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{request.seniorCity || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {request.servicesNeeded?.slice(0, 2).map((service: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{service}</Badge>
                          ))}
                          {(request.servicesNeeded?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">+{(request.servicesNeeded?.length || 0) - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status || "pending")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(request)} data-testid={`button-view-${request.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(request.id)} data-testid={`button-delete-${request.id}`}>
                            <Trash2 className="w-4 h-4" />
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Concierge Request Details
            </DialogTitle>
            <DialogDescription>Review and manage this concierge service request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Senior Name</Label><p className="font-medium flex items-center gap-2"><User className="w-4 h-4" />{selectedRequest.seniorName}</p></div>
                <div><Label className="text-muted-foreground">Senior Age</Label><p className="font-medium">{selectedRequest.seniorAge || "Not provided"}</p></div>
                <div><Label className="text-muted-foreground">Contact Name</Label><p className="font-medium">{selectedRequest.contactName}</p></div>
                <div><Label className="text-muted-foreground">Relationship</Label><p className="font-medium">{selectedRequest.relationshipToSenior || "Not provided"}</p></div>
                <div><Label className="text-muted-foreground">Email</Label><p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4" /><a href={`mailto:${selectedRequest.contactEmail}`} className="text-primary hover:underline">{selectedRequest.contactEmail}</a></p></div>
                <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium flex items-center gap-2"><Phone className="w-4 h-4" /><a href={`tel:${selectedRequest.contactPhone}`} className="text-primary hover:underline">{selectedRequest.contactPhone}</a></p></div>
                <div><Label className="text-muted-foreground">City</Label><p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" />{selectedRequest.seniorCity || "Not provided"}</p></div>
                <div><Label className="text-muted-foreground">Submitted</Label><p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4" />{selectedRequest.createdAt ? format(new Date(selectedRequest.createdAt), "PPP 'at' p") : "N/A"}</p></div>
              </div>

              <div>
                <Label className="text-muted-foreground">Requested Services</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRequest.servicesNeeded?.map((service: string, i: number) => (
                    <Badge key={i} variant="secondary">{service}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Frequency</Label><p className="font-medium">{selectedRequest.frequency || "Not specified"}</p></div>
                <div><Label className="text-muted-foreground">Preferred Time</Label><p className="font-medium">{selectedRequest.preferredTimeOfDay || "Not specified"}</p></div>
              </div>

              {selectedRequest.specialRequests && (
                <div>
                  <Label className="text-muted-foreground">Special Requests</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedRequest.specialRequests}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <Label className="text-muted-foreground">Update Status</Label>
                <Select value={selectedRequest.status || "pending"} onValueChange={(value) => handleUpdateStatus(selectedRequest.id, value)}>
                  <SelectTrigger className="mt-2" data-testid="select-update-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground">Internal Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this request..." className="mt-2" rows={3} data-testid="input-notes" />
                <Button className="mt-2" onClick={handleUpdateNotes} disabled={!notes.trim() || updateRequestMutation.isPending} data-testid="button-save-notes">Save Notes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
