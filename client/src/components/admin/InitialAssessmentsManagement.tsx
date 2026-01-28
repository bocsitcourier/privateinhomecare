import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PrintableFormDialog, { FormSection, FormField, FormFieldGrid } from "@/components/PrintableFormDialog";
import { format } from "date-fns";
import { 
  Plus, 
  Eye, 
  Trash2, 
  Calendar, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  Home,
  DollarSign,
  Shield,
  AlertTriangle,
  Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type InitialAssessment = {
  id: string;
  email: string;
  clientFullName: string;
  clientDateOfBirth: string;
  serviceAddress: string;
  responsiblePartyName: string;
  responsiblePartyRelationship: string;
  billingEmail: string;
  primaryPhone: string;
  careAssessment: {
    primaryDiagnosis: string;
    adlsRequired: string[];
    iadlsRequired: string[];
    medicalHistory: string;
    currentMedications: string;
  };
  homeSafety: {
    homeAccessMethod: string;
    keypadCodeOrKeyLocation: string;
    petsInHome: string;
    smokingPolicy: string;
  };
  serviceSchedule: {
    serviceStartDate: string;
    serviceDays: string[];
    shiftHours: string;
    guaranteedMinHours: string;
    recommendedLevelOfCare: string;
    careGoal: string;
  };
  financialAgreement: {
    standardHourlyRate: boolean;
    weekendHolidayRate: boolean;
    initialRetainerFee: boolean;
    additionalFees: string[];
    preferredPaymentMethod: string;
  };
  legalAcknowledgments: {
    agreedHipaa: boolean;
    agreedPrivacyPolicy: boolean;
    agreedTermsConditions: boolean;
    agreedCancellationPolicy: boolean;
    agreedNonSolicitation: boolean;
    understandNonMedical: boolean;
  };
  emergencyContact: {
    emergencyContactName: string;
    emergencyContactPhone: string;
    additionalPhone: string;
    preferredHospital: string;
  };
  electronicSignature: string;
  signatureDate: string;
  assignedClientId?: string;
  status: string;
  emailSentAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const PRIMARY_DIAGNOSES = [
  "Dementia/Alzheimer's",
  "Post-Surgical Recovery",
  "Mobility/Fall Risk",
  "Stroke Recovery",
  "Cancer Support",
  "General Frailty",
  "Other"
];

const ADLS = [
  "Bathing/Showering Assistance",
  "Dressing/Grooming",
  "Incontinence Care/Toileting",
  "Transferring (Pivot/Gait Belt)",
  "Transferring (Hoyer Lift)",
  "Feeding Assistance",
  "Oral Care"
];

const IADLS = [
  "Medication Reminders",
  "Meal Preparation (Special Diet)",
  "Light Housekeeping",
  "Laundry",
  "Transportation/Errands",
  "Safety Supervision/Companionship"
];

const LEVELS_OF_CARE = [
  "Hourly In-Home Care (4 Hours Minimum)",
  "Daily Care",
  "Overnight Care",
  "24-Hour / Live-In Care"
];

const HOME_ACCESS_OPTIONS = [
  "Lockbox",
  "Hidden Key",
  "Family will be present",
  "Key provided to Agency",
  "Keypad Code",
  "Other"
];

const PET_OPTIONS = [
  "None",
  "Dog(s) - Friendly",
  "Dog(s) - Will be kenneled",
  "Cat(s)",
  "Other"
];

const SMOKING_OPTIONS = [
  "Non-smoking household",
  "Smoking permitted outdoors only",
  "Smoking permitted indoors"
];

const CARE_GOALS = [
  "Short-term recovery",
  "Long-term support",
  "Transitional/post-discharge",
  "Other"
];

const PAYMENT_METHODS = [
  "ACH / Bank Transfer",
  "Credit/Debit Card (3% processing fee)",
  "Check"
];

const ADDITIONAL_FEES = [
  "Additional hours (current rate)",
  "Overnight differential $2.50 per Hour",
  "Weekend/Holiday rate $2.50 per Hour",
  "Short-notice / urgent start fee $3.50 per Hour",
  "Parking fee (going rate for particular location)",
  "Late payment fee 2.5% of Invoice (charged after 7 days receipt of invoice)"
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function InitialAssessmentsManagement() {
  const [selectedAssessment, setSelectedAssessment] = useState<InitialAssessment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InitialAssessment>>({
    careAssessment: { primaryDiagnosis: "", adlsRequired: [], iadlsRequired: [], medicalHistory: "", currentMedications: "" },
    homeSafety: { homeAccessMethod: "", keypadCodeOrKeyLocation: "", petsInHome: "", smokingPolicy: "" },
    serviceSchedule: { serviceStartDate: "", serviceDays: [], shiftHours: "", guaranteedMinHours: "", recommendedLevelOfCare: "", careGoal: "" },
    financialAgreement: { standardHourlyRate: false, weekendHolidayRate: false, initialRetainerFee: false, additionalFees: [], preferredPaymentMethod: "" },
    legalAcknowledgments: { agreedHipaa: false, agreedPrivacyPolicy: false, agreedTermsConditions: false, agreedCancellationPolicy: false, agreedNonSolicitation: false, understandNonMedical: false },
    emergencyContact: { emergencyContactName: "", emergencyContactPhone: "", additionalPhone: "", preferredHospital: "" },
  });
  const { toast } = useToast();

  const { data: assessments, isLoading } = useQuery<InitialAssessment[]>({
    queryKey: ["/api/admin/initial-assessments"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<InitialAssessment>) =>
      apiRequest("POST", "/api/admin/initial-assessments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/initial-assessments"] });
      toast({ title: "Success", description: "Assessment created successfully." });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create assessment." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InitialAssessment> }) =>
      apiRequest("PUT", `/api/admin/initial-assessments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/initial-assessments"] });
      toast({ title: "Success", description: "Assessment updated successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update assessment." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/initial-assessments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/initial-assessments"] });
      toast({ title: "Success", description: "Assessment deleted successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete assessment." });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/admin/initial-assessments/${id}/send-email`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/initial-assessments"] });
      toast({ title: "Success", description: "Email sent successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to send email." });
    },
  });

  const copyFormLink = () => {
    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/initial-assessment`;
    navigator.clipboard.writeText(formUrl);
    toast({ title: "Link Copied!", description: "Form link copied to clipboard. Share it with your client." });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      active: { variant: "secondary", icon: CheckCircle },
      completed: { variant: "destructive", icon: XCircle },
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

  const stats = {
    total: assessments?.length || 0,
    pending: assessments?.filter(a => a.status === "pending").length || 0,
    approved: assessments?.filter(a => a.status === "approved").length || 0,
    active: assessments?.filter(a => a.status === "active").length || 0,
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
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-bold" data-testid="text-page-title">Initial Assessments</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyFormLink} data-testid="button-copy-form-link">
            <Link2 className="w-4 h-4 mr-2" />
            Copy Form Link
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-new-assessment">
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assessments</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Responsible Party</TableHead>
                <TableHead>Level of Care</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments?.map((assessment) => (
                <TableRow key={assessment.id} data-testid={`row-assessment-${assessment.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{assessment.clientFullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{assessment.responsiblePartyName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {assessment.serviceSchedule.recommendedLevelOfCare}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {assessment.serviceSchedule.serviceStartDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAssessment(assessment);
                          setIsViewDialogOpen(true);
                        }}
                        data-testid={`button-view-${assessment.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => sendEmailMutation.mutate(assessment.id)}
                        disabled={sendEmailMutation.isPending}
                        data-testid={`button-email-${assessment.id}`}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(assessment.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${assessment.id}`}
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

      {/* View Dialog */}
      <PrintableFormDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        title="Initial Assessment & Service Agreement"
        subtitle={selectedAssessment ? `Client: ${selectedAssessment.clientFullName}` : undefined}
        formId={selectedAssessment?.id}
      >
        {selectedAssessment && (
          <div className="space-y-6">
            <FormSection title="Client & Responsible Party Information">
              <FormFieldGrid>
                <FormField label="Client Name" value={selectedAssessment.clientFullName} />
                <FormField label="Date of Birth" value={selectedAssessment.clientDateOfBirth} />
                <FormField label="Responsible Party" value={selectedAssessment.responsiblePartyName} />
                <FormField label="Relationship" value={selectedAssessment.responsiblePartyRelationship} />
                <FormField
                  label="Billing Email"
                  value={
                    <a href={`mailto:${selectedAssessment.billingEmail}`} className="text-primary hover:underline">
                      {selectedAssessment.billingEmail}
                    </a>
                  }
                />
                <FormField
                  label="Primary Phone"
                  value={
                    <a href={`tel:${selectedAssessment.primaryPhone}`} className="text-primary hover:underline">
                      {selectedAssessment.primaryPhone}
                    </a>
                  }
                />
              </FormFieldGrid>
              <div className="mt-4">
                <FormField label="Service Address" value={selectedAssessment.serviceAddress} />
              </div>
            </FormSection>

            <FormSection title="Care Assessment">
              <FormFieldGrid>
                <FormField label="Primary Diagnosis" value={selectedAssessment.careAssessment.primaryDiagnosis} />
              </FormFieldGrid>
              {selectedAssessment.careAssessment.adlsRequired?.length > 0 && (
                <div className="mt-4">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activities of Daily Living (ADLs)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAssessment.careAssessment.adlsRequired.map((adl, i) => (
                      <Badge key={i} variant="secondary">{adl}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedAssessment.careAssessment.iadlsRequired?.length > 0 && (
                <div className="mt-4">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Instrumental ADLs</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAssessment.careAssessment.iadlsRequired.map((iadl, i) => (
                      <Badge key={i} variant="outline">{iadl}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-4">
                <FormField label="Medical History & Allergies" value={selectedAssessment.careAssessment.medicalHistory} />
                <FormField label="Current Medications" value={selectedAssessment.careAssessment.currentMedications} />
              </div>
            </FormSection>

            <FormSection title="Home Safety & Access">
              <FormFieldGrid>
                <FormField label="Home Access Method" value={selectedAssessment.homeSafety.homeAccessMethod} />
                <FormField label="Keypad Code / Key Location" value={selectedAssessment.homeSafety.keypadCodeOrKeyLocation} />
                <FormField label="Pets in Home" value={selectedAssessment.homeSafety.petsInHome} />
                <FormField label="Smoking Policy" value={selectedAssessment.homeSafety.smokingPolicy} />
              </FormFieldGrid>
            </FormSection>

            <FormSection title="Service Schedule">
              <FormFieldGrid>
                <FormField label="Start Date" value={selectedAssessment.serviceSchedule.serviceStartDate} />
                <FormField label="Shift Hours" value={selectedAssessment.serviceSchedule.shiftHours} />
                <FormField label="Guaranteed Min Hours/Week" value={selectedAssessment.serviceSchedule.guaranteedMinHours || "N/A"} />
                <FormField label="Level of Care" value={selectedAssessment.serviceSchedule.recommendedLevelOfCare} />
              </FormFieldGrid>
              {selectedAssessment.serviceSchedule.serviceDays?.length > 0 && (
                <div className="mt-4">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Service Days</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAssessment.serviceSchedule.serviceDays.map((day, i) => (
                      <Badge key={i} variant="secondary">{day}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <FormField label="Care Goal" value={selectedAssessment.serviceSchedule.careGoal} />
              </div>
            </FormSection>

            <FormSection title="Financial Agreement">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  {selectedAssessment.financialAgreement.standardHourlyRate ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  <span>Standard Rate ($35.00/hr)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  {selectedAssessment.financialAgreement.weekendHolidayRate ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  <span>Weekend/Holiday ($37.50/hr)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  {selectedAssessment.financialAgreement.initialRetainerFee ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  <span>Initial Retainer ($1,225)</span>
                </div>
              </div>
              {selectedAssessment.financialAgreement.additionalFees?.length > 0 && (
                <div className="mt-4">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Additional Fees</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAssessment.financialAgreement.additionalFees.map((fee, i) => (
                      <Badge key={i} variant="outline">{fee}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <FormField label="Preferred Payment Method" value={selectedAssessment.financialAgreement.preferredPaymentMethod} />
              </div>
            </FormSection>

            <FormSection title="Legal Acknowledgments">
              <div className="space-y-2 text-sm">
                {Object.entries(selectedAssessment.legalAcknowledgments).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    {value ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                    <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  </div>
                ))}
              </div>
            </FormSection>

            <FormSection title="Emergency Contact">
              <FormFieldGrid>
                <FormField label="Contact Name" value={selectedAssessment.emergencyContact.emergencyContactName} />
                <FormField
                  label="Emergency Phone"
                  value={
                    selectedAssessment.emergencyContact.emergencyContactPhone ? (
                      <a href={`tel:${selectedAssessment.emergencyContact.emergencyContactPhone}`} className="text-primary hover:underline">
                        {selectedAssessment.emergencyContact.emergencyContactPhone}
                      </a>
                    ) : undefined
                  }
                />
                <FormField label="Additional Phone" value={selectedAssessment.emergencyContact.additionalPhone} />
                <FormField label="Preferred Hospital" value={selectedAssessment.emergencyContact.preferredHospital} />
              </FormFieldGrid>
            </FormSection>

            <FormSection title="Signature & Status">
              <FormFieldGrid>
                <FormField label="Electronic Signature" value={<span className="font-semibold italic">{selectedAssessment.electronicSignature}</span>} />
                <FormField label="Signature Date" value={selectedAssessment.signatureDate} />
                <FormField label="Date Created" value={format(new Date(selectedAssessment.createdAt), "PPpp")} />
                <FormField label="Current Status" value={getStatusBadge(selectedAssessment.status)} />
              </FormFieldGrid>
            </FormSection>

            <div className="no-print border-t pt-4">
              <div className="flex items-center gap-2">
                <Label>Update Status:</Label>
                <Select
                  value={selectedAssessment.status}
                  onValueChange={(value) => {
                    updateMutation.mutate({ id: selectedAssessment.id, data: { status: value } });
                    setSelectedAssessment({ ...selectedAssessment, status: value });
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </PrintableFormDialog>

      {/* Create Dialog - Complete form with all sections */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Initial Assessment & Service Agreement</DialogTitle>
            <DialogDescription>Complete all sections to create a comprehensive assessment</DialogDescription>
          </DialogHeader>
          
          <Accordion type="multiple" defaultValue={["client", "care", "home", "schedule", "financial", "legal", "emergency"]} className="w-full">
            {/* Section 1: Client Information */}
            <AccordionItem value="client">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  1. Client & Responsible Party Information
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientFullName">Client Full Name *</Label>
                    <Input
                      id="clientFullName"
                      value={formData.clientFullName || ""}
                      onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientDateOfBirth">Date of Birth *</Label>
                    <Input
                      id="clientDateOfBirth"
                      type="date"
                      value={formData.clientDateOfBirth || ""}
                      onChange={(e) => setFormData({ ...formData, clientDateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="serviceAddress">Service Address *</Label>
                    <Input
                      id="serviceAddress"
                      value={formData.serviceAddress || ""}
                      onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primaryPhone">Primary Phone *</Label>
                    <Input
                      id="primaryPhone"
                      value={formData.primaryPhone || ""}
                      onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsiblePartyName">Responsible Party Name *</Label>
                    <Input
                      id="responsiblePartyName"
                      value={formData.responsiblePartyName || ""}
                      onChange={(e) => setFormData({ ...formData, responsiblePartyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsiblePartyRelationship">Relationship *</Label>
                    <Input
                      id="responsiblePartyRelationship"
                      value={formData.responsiblePartyRelationship || ""}
                      onChange={(e) => setFormData({ ...formData, responsiblePartyRelationship: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingEmail">Billing Email *</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      value={formData.billingEmail || ""}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Care Assessment */}
            <AccordionItem value="care">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  2. Care Assessment
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Primary Diagnosis *</Label>
                  <Select
                    value={formData.careAssessment?.primaryDiagnosis}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      careAssessment: { ...formData.careAssessment!, primaryDiagnosis: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnosis" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIMARY_DIAGNOSES.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-2 block">Activities of Daily Living (ADLs) *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ADLS.map((adl) => (
                      <div key={adl} className="flex items-center space-x-2">
                        <Checkbox
                          id={`adl-${adl}`}
                          checked={formData.careAssessment?.adlsRequired?.includes(adl)}
                          onCheckedChange={(checked) => {
                            const current = formData.careAssessment?.adlsRequired || [];
                            setFormData({
                              ...formData,
                              careAssessment: {
                                ...formData.careAssessment!,
                                adlsRequired: checked 
                                  ? [...current, adl]
                                  : current.filter(a => a !== adl)
                              }
                            });
                          }}
                        />
                        <label htmlFor={`adl-${adl}`} className="text-sm">{adl}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Instrumental ADLs (IADLs) *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {IADLS.map((iadl) => (
                      <div key={iadl} className="flex items-center space-x-2">
                        <Checkbox
                          id={`iadl-${iadl}`}
                          checked={formData.careAssessment?.iadlsRequired?.includes(iadl)}
                          onCheckedChange={(checked) => {
                            const current = formData.careAssessment?.iadlsRequired || [];
                            setFormData({
                              ...formData,
                              careAssessment: {
                                ...formData.careAssessment!,
                                iadlsRequired: checked 
                                  ? [...current, iadl]
                                  : current.filter(i => i !== iadl)
                              }
                            });
                          }}
                        />
                        <label htmlFor={`iadl-${iadl}`} className="text-sm">{iadl}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="medicalHistory">Medical History & Allergies *</Label>
                  <Textarea
                    id="medicalHistory"
                    rows={3}
                    value={formData.careAssessment?.medicalHistory || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      careAssessment: { ...formData.careAssessment!, medicalHistory: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="currentMedications">Current Medications *</Label>
                  <Textarea
                    id="currentMedications"
                    rows={3}
                    value={formData.careAssessment?.currentMedications || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      careAssessment: { ...formData.careAssessment!, currentMedications: e.target.value }
                    })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Home Safety */}
            <AccordionItem value="home">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  3. Home Safety & Access
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Home Access Method *</Label>
                    <Select
                      value={formData.homeSafety?.homeAccessMethod}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        homeSafety: { ...formData.homeSafety!, homeAccessMethod: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select access method" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOME_ACCESS_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="keyLocation">Keypad Code / Key Location</Label>
                    <Input
                      id="keyLocation"
                      value={formData.homeSafety?.keypadCodeOrKeyLocation || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        homeSafety: { ...formData.homeSafety!, keypadCodeOrKeyLocation: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Pets in Home *</Label>
                    <Select
                      value={formData.homeSafety?.petsInHome}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        homeSafety: { ...formData.homeSafety!, petsInHome: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PET_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Smoking Policy *</Label>
                    <Select
                      value={formData.homeSafety?.smokingPolicy}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        homeSafety: { ...formData.homeSafety!, smokingPolicy: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select smoking policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {SMOKING_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 4: Service Schedule */}
            <AccordionItem value="schedule">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  4. Service Schedule
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serviceStartDate">Service Start Date *</Label>
                    <Input
                      id="serviceStartDate"
                      type="date"
                      value={formData.serviceSchedule?.serviceStartDate || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        serviceSchedule: { ...formData.serviceSchedule!, serviceStartDate: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shiftHours">Shift Hours *</Label>
                    <Input
                      id="shiftHours"
                      placeholder="e.g., 8:00 AM - 12:00 PM"
                      value={formData.serviceSchedule?.shiftHours || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        serviceSchedule: { ...formData.serviceSchedule!, shiftHours: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guaranteedMinHours">Guaranteed Min Hours/Week</Label>
                    <Input
                      id="guaranteedMinHours"
                      placeholder="e.g., 20"
                      value={formData.serviceSchedule?.guaranteedMinHours || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        serviceSchedule: { ...formData.serviceSchedule!, guaranteedMinHours: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Level of Care *</Label>
                    <Select
                      value={formData.serviceSchedule?.recommendedLevelOfCare}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        serviceSchedule: { ...formData.serviceSchedule!, recommendedLevelOfCare: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS_OF_CARE.map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Service Days *</Label>
                  <div className="flex flex-wrap gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={formData.serviceSchedule?.serviceDays?.includes(day)}
                          onCheckedChange={(checked) => {
                            const current = formData.serviceSchedule?.serviceDays || [];
                            setFormData({
                              ...formData,
                              serviceSchedule: {
                                ...formData.serviceSchedule!,
                                serviceDays: checked 
                                  ? [...current, day]
                                  : current.filter(d => d !== day)
                              }
                            });
                          }}
                        />
                        <label htmlFor={`day-${day}`} className="text-sm">{day}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Care Goal *</Label>
                  <Select
                    value={formData.serviceSchedule?.careGoal}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      serviceSchedule: { ...formData.serviceSchedule!, careGoal: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select care goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARE_GOALS.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 5: Financial Agreement */}
            <AccordionItem value="financial">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  5. Financial Agreement
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="standardRate"
                      checked={formData.financialAgreement?.standardHourlyRate}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        financialAgreement: { ...formData.financialAgreement!, standardHourlyRate: checked as boolean }
                      })}
                    />
                    <label htmlFor="standardRate" className="text-sm font-medium">Standard Hourly Rate ($35.00/hr)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weekendRate"
                      checked={formData.financialAgreement?.weekendHolidayRate}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        financialAgreement: { ...formData.financialAgreement!, weekendHolidayRate: checked as boolean }
                      })}
                    />
                    <label htmlFor="weekendRate" className="text-sm font-medium">Weekend/Holiday Rate ($37.50/hr)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="retainer"
                      checked={formData.financialAgreement?.initialRetainerFee}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        financialAgreement: { ...formData.financialAgreement!, initialRetainerFee: checked as boolean }
                      })}
                    />
                    <label htmlFor="retainer" className="text-sm font-medium">Initial Retainer Fee ($1,225)</label>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Additional Fees (if applicable)</Label>
                  <div className="space-y-2">
                    {ADDITIONAL_FEES.map((fee) => (
                      <div key={fee} className="flex items-center space-x-2">
                        <Checkbox
                          id={`fee-${fee}`}
                          checked={formData.financialAgreement?.additionalFees?.includes(fee)}
                          onCheckedChange={(checked) => {
                            const current = formData.financialAgreement?.additionalFees || [];
                            setFormData({
                              ...formData,
                              financialAgreement: {
                                ...formData.financialAgreement!,
                                additionalFees: checked 
                                  ? [...current, fee]
                                  : current.filter(f => f !== fee)
                              }
                            });
                          }}
                        />
                        <label htmlFor={`fee-${fee}`} className="text-sm">{fee}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Preferred Payment Method *</Label>
                  <Select
                    value={formData.financialAgreement?.preferredPaymentMethod}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      financialAgreement: { ...formData.financialAgreement!, preferredPaymentMethod: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 6: Legal Acknowledgments */}
            <AccordionItem value="legal">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  6. Legal Acknowledgments
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hipaa"
                    checked={formData.legalAcknowledgments?.agreedHipaa}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      legalAcknowledgments: { ...formData.legalAcknowledgments!, agreedHipaa: checked as boolean }
                    })}
                  />
                  <label htmlFor="hipaa" className="text-sm">I acknowledge the HIPAA Notice of Privacy Practices</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={formData.legalAcknowledgments?.agreedPrivacyPolicy}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      legalAcknowledgments: { ...formData.legalAcknowledgments!, agreedPrivacyPolicy: checked as boolean }
                    })}
                  />
                  <label htmlFor="privacy" className="text-sm">I agree to the Privacy Policy</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.legalAcknowledgments?.agreedTermsConditions}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      legalAcknowledgments: { ...formData.legalAcknowledgments!, agreedTermsConditions: checked as boolean }
                    })}
                  />
                  <label htmlFor="terms" className="text-sm">I agree to the Terms & Conditions</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cancellation"
                    checked={formData.legalAcknowledgments?.agreedCancellationPolicy}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      legalAcknowledgments: { ...formData.legalAcknowledgments!, agreedCancellationPolicy: checked as boolean }
                    })}
                  />
                  <label htmlFor="cancellation" className="text-sm">I agree to the Cancellation Policy (24-hour notice)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nonSolicitation"
                    checked={formData.legalAcknowledgments?.agreedNonSolicitation}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      legalAcknowledgments: { ...formData.legalAcknowledgments!, agreedNonSolicitation: checked as boolean }
                    })}
                  />
                  <label htmlFor="nonSolicitation" className="text-sm">I agree to the Non-Solicitation Agreement</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nonMedical"
                    checked={formData.legalAcknowledgments?.understandNonMedical}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      legalAcknowledgments: { ...formData.legalAcknowledgments!, understandNonMedical: checked as boolean }
                    })}
                  />
                  <label htmlFor="nonMedical" className="text-sm">I understand services are non-medical personal care only</label>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 7: Emergency Contact & Signature */}
            <AccordionItem value="emergency">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  7. Emergency Contact & Signature
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContact?.emergencyContactName || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact!, emergencyContactName: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Phone *</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContact?.emergencyContactPhone || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact!, emergencyContactPhone: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="additionalPhone">Additional Phone</Label>
                    <Input
                      id="additionalPhone"
                      value={formData.emergencyContact?.additionalPhone || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact!, additionalPhone: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredHospital">Preferred Hospital *</Label>
                    <Input
                      id="preferredHospital"
                      value={formData.emergencyContact?.preferredHospital || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact!, preferredHospital: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="electronicSignature">Electronic Signature (Full Name) *</Label>
                    <Input
                      id="electronicSignature"
                      value={formData.electronicSignature || ""}
                      onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signatureDate">Signature Date *</Label>
                    <Input
                      id="signatureDate"
                      type="date"
                      value={formData.signatureDate || ""}
                      onChange={(e) => setFormData({ ...formData, signatureDate: e.target.value })}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending}
              data-testid="button-submit-assessment"
            >
              Create Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
