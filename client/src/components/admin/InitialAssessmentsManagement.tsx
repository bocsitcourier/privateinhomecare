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
  AlertTriangle
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" data-testid="text-page-title">Initial Assessments</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-new-assessment">
          <Plus className="w-4 h-4 mr-2" />
          New Assessment
        </Button>
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
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Initial Assessment Details</DialogTitle>
            <DialogDescription>View comprehensive assessment and service agreement</DialogDescription>
          </DialogHeader>
          {selectedAssessment && (
            <Accordion type="multiple" defaultValue={["client", "care", "schedule", "financial"]} className="w-full">
              <AccordionItem value="client">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client & Responsible Party Information
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <div>
                      <Label>Client Name</Label>
                      <p className="text-sm">{selectedAssessment.clientFullName}</p>
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <p className="text-sm">{selectedAssessment.clientDateOfBirth}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Service Address</Label>
                      <p className="text-sm">{selectedAssessment.serviceAddress}</p>
                    </div>
                    <div>
                      <Label>Responsible Party</Label>
                      <p className="text-sm">{selectedAssessment.responsiblePartyName}</p>
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <p className="text-sm">{selectedAssessment.responsiblePartyRelationship}</p>
                    </div>
                    <div>
                      <Label>Billing Email</Label>
                      <p className="text-sm">{selectedAssessment.billingEmail}</p>
                    </div>
                    <div>
                      <Label>Primary Phone</Label>
                      <p className="text-sm">{selectedAssessment.primaryPhone}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Care Assessment
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div>
                      <Label>Primary Diagnosis</Label>
                      <p className="text-sm">{selectedAssessment.careAssessment.primaryDiagnosis}</p>
                    </div>
                    <div>
                      <Label>Activities of Daily Living (ADLs) Required</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedAssessment.careAssessment.adlsRequired?.map((adl, i) => (
                          <Badge key={i} variant="secondary">{adl}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Instrumental ADLs Required</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedAssessment.careAssessment.iadlsRequired?.map((iadl, i) => (
                          <Badge key={i} variant="outline">{iadl}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Medical History & Allergies</Label>
                      <p className="text-sm whitespace-pre-wrap">{selectedAssessment.careAssessment.medicalHistory}</p>
                    </div>
                    <div>
                      <Label>Current Medications</Label>
                      <p className="text-sm whitespace-pre-wrap">{selectedAssessment.careAssessment.currentMedications}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="home">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home Safety & Access
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <div>
                      <Label>Home Access Method</Label>
                      <p className="text-sm">{selectedAssessment.homeSafety.homeAccessMethod}</p>
                    </div>
                    <div>
                      <Label>Keypad Code / Key Location</Label>
                      <p className="text-sm">{selectedAssessment.homeSafety.keypadCodeOrKeyLocation}</p>
                    </div>
                    <div>
                      <Label>Pets in Home</Label>
                      <p className="text-sm">{selectedAssessment.homeSafety.petsInHome}</p>
                    </div>
                    <div>
                      <Label>Smoking Policy</Label>
                      <p className="text-sm">{selectedAssessment.homeSafety.smokingPolicy}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Service Schedule
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <div>
                      <Label>Start Date</Label>
                      <p className="text-sm">{selectedAssessment.serviceSchedule.serviceStartDate}</p>
                    </div>
                    <div>
                      <Label>Service Days</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAssessment.serviceSchedule.serviceDays?.map((day, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{day}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Shift Hours</Label>
                      <p className="text-sm">{selectedAssessment.serviceSchedule.shiftHours}</p>
                    </div>
                    <div>
                      <Label>Guaranteed Minimum Hours/Week</Label>
                      <p className="text-sm">{selectedAssessment.serviceSchedule.guaranteedMinHours || "N/A"}</p>
                    </div>
                    <div>
                      <Label>Level of Care</Label>
                      <p className="text-sm font-medium">{selectedAssessment.serviceSchedule.recommendedLevelOfCare}</p>
                    </div>
                    <div>
                      <Label>Care Goal</Label>
                      <p className="text-sm">{selectedAssessment.serviceSchedule.careGoal}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="financial">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Agreement
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        {selectedAssessment.financialAgreement.standardHourlyRate ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="text-sm">Standard Rate ($35.00/hr)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAssessment.financialAgreement.weekendHolidayRate ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="text-sm">Weekend/Holiday Rate ($37.50/hr)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAssessment.financialAgreement.initialRetainerFee ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="text-sm">Initial Retainer ($1,225.00)</span>
                      </div>
                    </div>
                    <div>
                      <Label>Additional Fees</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedAssessment.financialAgreement.additionalFees?.map((fee, i) => (
                          <Badge key={i} variant="outline">{fee}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Preferred Payment Method</Label>
                      <p className="text-sm">{selectedAssessment.financialAgreement.preferredPaymentMethod}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="legal">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Legal Acknowledgments
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-4">
                    {Object.entries(selectedAssessment.legalAcknowledgments).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="emergency">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Emergency Contact
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <div>
                      <Label>Emergency Contact Name</Label>
                      <p className="text-sm">{selectedAssessment.emergencyContact.emergencyContactName}</p>
                    </div>
                    <div>
                      <Label>Emergency Phone</Label>
                      <p className="text-sm">{selectedAssessment.emergencyContact.emergencyContactPhone}</p>
                    </div>
                    <div>
                      <Label>Additional Phone</Label>
                      <p className="text-sm">{selectedAssessment.emergencyContact.additionalPhone}</p>
                    </div>
                    <div>
                      <Label>Preferred Hospital</Label>
                      <p className="text-sm">{selectedAssessment.emergencyContact.preferredHospital}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {selectedAssessment && (
            <div className="pt-4 border-t mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Signature: </Label>
                  <span className="text-sm font-medium">{selectedAssessment.electronicSignature}</span>
                  <span className="text-sm text-muted-foreground ml-2">({selectedAssessment.signatureDate})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Status:</Label>
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
        </DialogContent>
      </Dialog>

      {/* Create Dialog - Simplified for admin entry */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Initial Assessment</DialogTitle>
            <DialogDescription>Enter client assessment and service agreement details</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
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
                <Label htmlFor="electronicSignature">Electronic Signature *</Label>
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
          </div>
          <DialogFooter>
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
