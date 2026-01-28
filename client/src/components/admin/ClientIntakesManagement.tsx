import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PrintableFormDialog, { FormSection, FormField, FormFieldGrid } from "@/components/PrintableFormDialog";
import { format } from "date-fns";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  User,
  CheckCircle,
  Clock,
  XCircle,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ClientIntake = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  primaryPhysician?: string;
  physicianPhone?: string;
  medicalConditions?: string;
  medications?: string;
  allergies?: string;
  mobilityStatus?: string;
  dietaryRestrictions?: string;
  careNeeds: string[];
  preferredSchedule?: string;
  additionalNotes?: string;
  assignedCaregiverId?: string;
  status: string;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ClientIntakesManagement() {
  const [selectedIntake, setSelectedIntake] = useState<ClientIntake | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientIntake>>({});
  const { toast } = useToast();

  const { data: intakes, isLoading } = useQuery<ClientIntake[]>({
    queryKey: ["/api/admin/client-intakes"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ClientIntake>) =>
      apiRequest("POST", "/api/admin/client-intakes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/client-intakes"] });
      toast({ title: "Success", description: "Client intake created successfully." });
      setIsCreateDialogOpen(false);
      setFormData({});
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create client intake." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientIntake> }) =>
      apiRequest("PUT", `/api/admin/client-intakes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/client-intakes"] });
      toast({ title: "Success", description: "Client intake updated successfully." });
      setSelectedIntake(null);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update client intake." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/client-intakes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/client-intakes"] });
      toast({ title: "Success", description: "Client intake deleted successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete client intake." });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/admin/client-intakes/${id}/send-email`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/client-intakes"] });
      toast({ title: "Success", description: "Email sent successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to send email." });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      active: { variant: "default", icon: CheckCircle },
      on_hold: { variant: "secondary", icon: Clock },
      discharged: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const stats = {
    total: intakes?.length || 0,
    pending: intakes?.filter(i => i.status === "pending").length || 0,
    active: intakes?.filter(i => i.status === "active").length || 0,
    discharged: intakes?.filter(i => i.status === "discharged").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" data-testid="text-page-title">Client Intakes</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-new-intake">
          <Plus className="w-4 h-4 mr-2" />
          New Client Intake
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Intakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Discharged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.discharged}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {intakes?.map((intake) => (
                <TableRow key={intake.id} data-testid={`row-intake-${intake.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{intake.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {intake.clientEmail}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {intake.clientPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(intake.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(intake.createdAt), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedIntake(intake);
                          setIsViewDialogOpen(true);
                        }}
                        data-testid={`button-view-${intake.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => sendEmailMutation.mutate(intake.id)}
                        disabled={sendEmailMutation.isPending}
                        data-testid={`button-email-${intake.id}`}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(intake.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${intake.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      <PrintableFormDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        title="Client Intake Form"
        subtitle={selectedIntake ? `Client: ${selectedIntake.clientName}` : undefined}
        formId={selectedIntake?.id}
      >
        {selectedIntake && (
          <div className="space-y-6">
            <FormSection title="Client Information">
              <FormFieldGrid>
                <FormField label="Client Name" value={selectedIntake.clientName} />
                <FormField
                  label="Email Address"
                  value={
                    <a href={`mailto:${selectedIntake.clientEmail}`} className="text-primary hover:underline">
                      {selectedIntake.clientEmail}
                    </a>
                  }
                />
                <FormField
                  label="Phone Number"
                  value={
                    <a href={`tel:${selectedIntake.clientPhone}`} className="text-primary hover:underline">
                      {selectedIntake.clientPhone}
                    </a>
                  }
                />
                <FormField label="Date of Birth" value={selectedIntake.dateOfBirth} />
              </FormFieldGrid>
              <div className="mt-4">
                <FormField label="Address" value={selectedIntake.address} />
              </div>
            </FormSection>

            <FormSection title="Emergency Contact">
              <FormFieldGrid>
                <FormField label="Contact Name" value={selectedIntake.emergencyContactName} />
                <FormField
                  label="Contact Phone"
                  value={
                    selectedIntake.emergencyContactPhone ? (
                      <a href={`tel:${selectedIntake.emergencyContactPhone}`} className="text-primary hover:underline">
                        {selectedIntake.emergencyContactPhone}
                      </a>
                    ) : undefined
                  }
                />
                <FormField label="Relationship" value={selectedIntake.emergencyContactRelationship} />
              </FormFieldGrid>
            </FormSection>

            <FormSection title="Medical Information">
              <FormFieldGrid>
                <FormField label="Insurance Provider" value={selectedIntake.insuranceProvider} />
                <FormField label="Policy Number" value={selectedIntake.insurancePolicyNumber} />
                <FormField label="Primary Physician" value={selectedIntake.primaryPhysician} />
                <FormField label="Physician Phone" value={selectedIntake.physicianPhone} />
              </FormFieldGrid>
              <div className="mt-4 space-y-4">
                <FormField label="Medical Conditions" value={selectedIntake.medicalConditions} />
                <FormField label="Current Medications" value={selectedIntake.medications} />
                <FormField label="Allergies" value={selectedIntake.allergies} />
                <FormField label="Mobility Status" value={selectedIntake.mobilityStatus} />
                <FormField label="Dietary Restrictions" value={selectedIntake.dietaryRestrictions} />
              </div>
            </FormSection>

            <FormSection title="Care Requirements">
              <FormField label="Preferred Schedule" value={selectedIntake.preferredSchedule} />
              {selectedIntake.careNeeds && selectedIntake.careNeeds.length > 0 && (
                <div className="mt-4">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Care Needs</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedIntake.careNeeds.map((need, i) => (
                      <Badge key={i} variant="secondary">{need}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedIntake.additionalNotes && (
                <div className="mt-4">
                  <FormField label="Additional Notes" value={selectedIntake.additionalNotes} />
                </div>
              )}
            </FormSection>

            <FormSection title="Status & Tracking">
              <FormFieldGrid>
                <FormField label="Date Created" value={format(new Date(selectedIntake.createdAt), "PPpp")} />
                <FormField label="Current Status" value={getStatusBadge(selectedIntake.status)} />
                <FormField label="Email Sent" value={selectedIntake.emailSentAt ? format(new Date(selectedIntake.emailSentAt), "PPpp") : "Not sent"} />
              </FormFieldGrid>
            </FormSection>

            <div className="no-print border-t pt-4">
              <Label>Update Status</Label>
              <Select
                value={selectedIntake.status}
                onValueChange={(value) => {
                  updateMutation.mutate({ id: selectedIntake.id, data: { status: value } });
                }}
              >
                <SelectTrigger className="w-[200px] mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </PrintableFormDialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Client Intake</DialogTitle>
            <DialogDescription>Add a new client to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName || ""}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  data-testid="input-client-name"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail || ""}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  data-testid="input-client-email"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone *</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone || ""}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  data-testid="input-client-phone"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  data-testid="input-dob"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  data-testid="input-address"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName || ""}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  data-testid="input-emergency-name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone || ""}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  data-testid="input-emergency-phone"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions || ""}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  data-testid="input-medical-conditions"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="preferredSchedule">Preferred Schedule</Label>
                <Input
                  id="preferredSchedule"
                  value={formData.preferredSchedule || ""}
                  onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                  placeholder="e.g., Monday-Friday, 8am-4pm"
                  data-testid="input-schedule"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending || !formData.clientName || !formData.clientEmail || !formData.clientPhone}
              data-testid="button-submit-intake"
            >
              Create Intake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
