import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Mail, 
  Calendar, 
  User,
  FileCheck,
  DollarSign,
  Send,
  Shield,
  AlertTriangle,
  Link2,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type NonSolicitationAgreement = {
  id: string;
  clientFullName: string;
  responsibleParty: string;
  billingAddress: string;
  email: string;
  phone?: string;
  placementOption: string;
  agreementTerms: {
    noPrivateEmployment: boolean;
    noReferralForPrivateHire: boolean;
    understandUnderTablePayments: boolean;
  };
  penaltyAcknowledgments: {
    agreedToLiquidatedDamages: boolean;
    agreedToLegalFees: boolean;
  };
  electronicSignature: string;
  agreementDate: string;
  assignedClientId?: string;
  status: string;
  emailSentAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const PLACEMENT_OPTIONS = {
  option_a: "Immediate Buyout Fee ($3,500.00)",
  option_b: "Transition after 300 hours + $1,500.00 Fee",
  no_hire: "12-month Non-Solicitation Agreement"
};

export default function NonSolicitationManagement() {
  const [selectedAgreement, setSelectedAgreement] = useState<NonSolicitationAgreement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<NonSolicitationAgreement>>({
    agreementTerms: {
      noPrivateEmployment: false,
      noReferralForPrivateHire: false,
      understandUnderTablePayments: false,
    },
    penaltyAcknowledgments: {
      agreedToLiquidatedDamages: false,
      agreedToLegalFees: false,
    },
  });
  const { toast } = useToast();

  const { data: agreements, isLoading } = useQuery<NonSolicitationAgreement[]>({
    queryKey: ["/api/admin/non-solicitation-agreements"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<NonSolicitationAgreement>) =>
      apiRequest("POST", "/api/admin/non-solicitation-agreements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/non-solicitation-agreements"] });
      toast({ title: "Success", description: "Agreement created successfully." });
      setIsCreateDialogOpen(false);
      setFormData({
        agreementTerms: {
          noPrivateEmployment: false,
          noReferralForPrivateHire: false,
          understandUnderTablePayments: false,
        },
        penaltyAcknowledgments: {
          agreedToLiquidatedDamages: false,
          agreedToLegalFees: false,
        },
      });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create agreement." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NonSolicitationAgreement> }) =>
      apiRequest("PUT", `/api/admin/non-solicitation-agreements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/non-solicitation-agreements"] });
      toast({ title: "Success", description: "Agreement updated successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update agreement." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/non-solicitation-agreements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/non-solicitation-agreements"] });
      toast({ title: "Success", description: "Agreement deleted successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete agreement." });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/admin/non-solicitation-agreements/${id}/send-email`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/non-solicitation-agreements"] });
      toast({ title: "Success", description: "Email sent successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to send email." });
    },
  });

  const copyFormLink = () => {
    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/non-solicitation-agreement`;
    navigator.clipboard.writeText(formUrl);
    toast({ title: "Link Copied!", description: "Form link copied to clipboard. Share it with your client." });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      converted: "secondary",
      terminated: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPlacementBadge = (option: string) => {
    const colors: Record<string, string> = {
      option_a: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      option_b: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      no_hire: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return (
      <Badge className={colors[option] || ""}>
        <DollarSign className="h-3 w-3 mr-1" />
        {option === "option_a" ? "$3,500" : option === "option_b" ? "$1,500" : "No Hire"}
      </Badge>
    );
  };

  const stats = {
    total: agreements?.length || 0,
    active: agreements?.filter(a => a.status === "active").length || 0,
    converted: agreements?.filter(a => a.status === "converted").length || 0,
    buyouts: agreements?.filter(a => a.placementOption === "option_a" || a.placementOption === "option_b").length || 0,
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
        <h2 className="text-2xl font-bold" data-testid="text-page-title">Non-Solicitation Agreements</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyFormLink} data-testid="button-copy-form-link">
            <Link2 className="w-4 h-4 mr-2" />
            Copy Form Link
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-new-agreement">
            <Plus className="w-4 h-4 mr-2" />
            New Agreement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.converted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buyout Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.buyouts}</div>
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
                <TableHead>Placement Option</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements?.map((agreement) => (
                <TableRow key={agreement.id} data-testid={`row-agreement-${agreement.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{agreement.clientFullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{agreement.responsibleParty}</TableCell>
                  <TableCell>{getPlacementBadge(agreement.placementOption)}</TableCell>
                  <TableCell>{getStatusBadge(agreement.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {agreement.agreementDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAgreement(agreement);
                          setIsViewDialogOpen(true);
                        }}
                        data-testid={`button-view-${agreement.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => sendEmailMutation.mutate(agreement.id)}
                        disabled={sendEmailMutation.isPending}
                        data-testid={`button-email-${agreement.id}`}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(agreement.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${agreement.id}`}
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
        title="Non-Solicitation Agreement"
        subtitle={selectedAgreement ? `Client: ${selectedAgreement.clientFullName}` : undefined}
        formId={selectedAgreement?.id}
      >
        {selectedAgreement && (
          <div className="space-y-6">
            <FormSection title="Client Information">
              <FormFieldGrid>
                <FormField label="Client Name" value={selectedAgreement.clientFullName} />
                <FormField label="Responsible Party" value={selectedAgreement.responsibleParty} />
                <FormField
                  label="Email Address"
                  value={
                    <a href={`mailto:${selectedAgreement.email}`} className="text-primary hover:underline">
                      {selectedAgreement.email}
                    </a>
                  }
                />
                <FormField
                  label="Phone Number"
                  value={
                    selectedAgreement.phone ? (
                      <a href={`tel:${selectedAgreement.phone}`} className="text-primary hover:underline">
                        {selectedAgreement.phone}
                      </a>
                    ) : undefined
                  }
                />
              </FormFieldGrid>
              <div className="mt-4">
                <FormField label="Billing Address" value={selectedAgreement.billingAddress} />
              </div>
            </FormSection>

            <FormSection title="Placement Option">
              <FormField
                label="Selected Option"
                value={
                  <span className="font-medium">
                    {PLACEMENT_OPTIONS[selectedAgreement.placementOption as keyof typeof PLACEMENT_OPTIONS]}
                  </span>
                }
              />
            </FormSection>

            <FormSection title="Agreement Terms">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  {selectedAgreement.agreementTerms.noPrivateEmployment ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                  <span>Will not offer private employment to Agency caregivers</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  {selectedAgreement.agreementTerms.noReferralForPrivateHire ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                  <span>Will not refer Agency caregivers to other families</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  {selectedAgreement.agreementTerms.understandUnderTablePayments ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                  <span>Understands under-the-table payments are a breach</span>
                </div>
              </div>
            </FormSection>

            <FormSection title="Penalty Acknowledgments">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  {selectedAgreement.penaltyAcknowledgments.agreedToLiquidatedDamages ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                  <span>Agreed to $5,000 liquidated damages for breach</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  {selectedAgreement.penaltyAcknowledgments.agreedToLegalFees ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                  <span>Agreed to pay legal and collection fees</span>
                </div>
              </div>
            </FormSection>

            <FormSection title="Signature & Agreement">
              <FormFieldGrid>
                <FormField label="Electronic Signature" value={<span className="font-semibold italic">{selectedAgreement.electronicSignature}</span>} />
                <FormField label="Agreement Date" value={selectedAgreement.agreementDate} />
                <FormField label="Date Created" value={format(new Date(selectedAgreement.createdAt), "PPpp")} />
                <FormField label="Current Status" value={getStatusBadge(selectedAgreement.status)} />
              </FormFieldGrid>
            </FormSection>

            <div className="no-print border-t pt-4">
              <Label>Update Status</Label>
              <Select
                value={selectedAgreement.status}
                onValueChange={(value) => {
                  updateMutation.mutate({ id: selectedAgreement.id, data: { status: value } });
                  setSelectedAgreement({ ...selectedAgreement, status: value });
                }}
              >
                <SelectTrigger className="w-[200px] mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </PrintableFormDialog>

      {/* Create Dialog - Complete 5-Step Form */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Non-Solicitation & Placement Agreement</DialogTitle>
            <DialogDescription>Complete all 5 sections to create a comprehensive agreement</DialogDescription>
          </DialogHeader>
          
          <Accordion type="multiple" defaultValue={["client", "terms", "placement", "penalties", "signature"]} className="w-full">
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
                      data-testid="input-client-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsibleParty">Responsible Party Name *</Label>
                    <Input
                      id="responsibleParty"
                      value={formData.responsibleParty || ""}
                      onChange={(e) => setFormData({ ...formData, responsibleParty: e.target.value })}
                      data-testid="input-responsible-party"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="billingAddress">Billing Address *</Label>
                    <Input
                      id="billingAddress"
                      placeholder="Full street address, city, state, zip"
                      value={formData.billingAddress || ""}
                      onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                      data-testid="input-billing-address"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Non-Solicitation Terms */}
            <AccordionItem value="terms">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  2. Non-Solicitation Agreement Terms
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  By checking the boxes below, the Client/Responsible Party agrees to the following terms during the service period and for 12 months after termination:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="noPrivateEmployment"
                      checked={formData.agreementTerms?.noPrivateEmployment}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        agreementTerms: { ...formData.agreementTerms!, noPrivateEmployment: checked as boolean }
                      })}
                    />
                    <label htmlFor="noPrivateEmployment" className="text-sm leading-relaxed">
                      <strong>No Private Employment:</strong> I will not directly or indirectly hire, employ, or engage any caregiver introduced by PrivateInHomeCareGiver LLC for private employment.
                    </label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="noReferral"
                      checked={formData.agreementTerms?.noReferralForPrivateHire}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        agreementTerms: { ...formData.agreementTerms!, noReferralForPrivateHire: checked as boolean }
                      })}
                    />
                    <label htmlFor="noReferral" className="text-sm leading-relaxed">
                      <strong>No Referrals:</strong> I will not refer, recommend, or facilitate the employment of any Agency caregiver to other families, individuals, or organizations for private hire.
                    </label>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="understandPayments"
                      checked={formData.agreementTerms?.understandUnderTablePayments}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        agreementTerms: { ...formData.agreementTerms!, understandUnderTablePayments: checked as boolean }
                      })}
                    />
                    <label htmlFor="understandPayments" className="text-sm leading-relaxed">
                      <strong>No Under-the-Table Payments:</strong> I understand that paying caregivers directly ("under-the-table") constitutes a breach of contract and may result in immediate termination of services and legal action.
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Placement Options */}
            <AccordionItem value="placement">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  3. Direct Hire Placement Options
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  If you wish to hire a caregiver directly, you must select one of the following placement options:
                </p>
                <div className="space-y-3">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.placementOption === 'option_a' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'}`}
                    onClick={() => setFormData({ ...formData, placementOption: 'option_a' })}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        checked={formData.placementOption === 'option_a'} 
                        onChange={() => setFormData({ ...formData, placementOption: 'option_a' })}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-semibold">Option A: Immediate Buyout</p>
                        <p className="text-sm text-muted-foreground">One-time fee of $3,500.00 to immediately hire the caregiver</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.placementOption === 'option_b' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'}`}
                    onClick={() => setFormData({ ...formData, placementOption: 'option_b' })}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        checked={formData.placementOption === 'option_b'} 
                        onChange={() => setFormData({ ...formData, placementOption: 'option_b' })}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-semibold">Option B: Transition After 300 Hours</p>
                        <p className="text-sm text-muted-foreground">Complete 300 service hours through Agency, then pay $1,500.00 placement fee</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.placementOption === 'no_hire' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'}`}
                    onClick={() => setFormData({ ...formData, placementOption: 'no_hire' })}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        checked={formData.placementOption === 'no_hire'} 
                        onChange={() => setFormData({ ...formData, placementOption: 'no_hire' })}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-semibold">No Intent to Hire Directly</p>
                        <p className="text-sm text-muted-foreground">I do not intend to hire the caregiver directly (12-month non-solicitation period applies)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 4: Penalty Acknowledgments */}
            <AccordionItem value="penalties">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  4. Breach & Penalty Acknowledgments
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  By checking the boxes below, you acknowledge and agree to the following penalty provisions:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <Checkbox
                      id="liquidatedDamages"
                      checked={formData.penaltyAcknowledgments?.agreedToLiquidatedDamages}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        penaltyAcknowledgments: { ...formData.penaltyAcknowledgments!, agreedToLiquidatedDamages: checked as boolean }
                      })}
                    />
                    <label htmlFor="liquidatedDamages" className="text-sm leading-relaxed">
                      <strong>Liquidated Damages:</strong> I understand and agree that any breach of this Non-Solicitation Agreement will result in <strong>$5,000.00 in liquidated damages</strong>, payable immediately upon breach, in addition to any applicable placement fees.
                    </label>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <Checkbox
                      id="legalFees"
                      checked={formData.penaltyAcknowledgments?.agreedToLegalFees}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        penaltyAcknowledgments: { ...formData.penaltyAcknowledgments!, agreedToLegalFees: checked as boolean }
                      })}
                    />
                    <label htmlFor="legalFees" className="text-sm leading-relaxed">
                      <strong>Legal & Collection Fees:</strong> I agree to pay all reasonable attorney fees, court costs, and collection expenses incurred by PrivateInHomeCareGiver LLC to enforce this agreement.
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 5: Signature */}
            <AccordionItem value="signature">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  5. Electronic Signature
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  By typing your full legal name below, you are electronically signing this agreement and acknowledging that you have read, understood, and agree to all terms and conditions stated herein.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="electronicSignature">Full Legal Name *</Label>
                    <Input
                      id="electronicSignature"
                      placeholder="Type your full legal name"
                      value={formData.electronicSignature || ""}
                      onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
                      className="font-semibold italic"
                      data-testid="input-signature"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agreementDate">Date Signed *</Label>
                    <Input
                      id="agreementDate"
                      type="date"
                      value={formData.agreementDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, agreementDate: e.target.value })}
                      data-testid="input-agreement-date"
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
              disabled={createMutation.isPending || !formData.clientFullName || !formData.email || !formData.placementOption || !formData.electronicSignature}
              data-testid="button-submit-agreement"
            >
              Create Agreement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
