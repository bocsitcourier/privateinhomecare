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
  Shield
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" data-testid="text-page-title">Non-Solicitation Agreements</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-new-agreement">
          <Plus className="w-4 h-4 mr-2" />
          New Agreement
        </Button>
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
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Non-Solicitation Agreement Details</DialogTitle>
            <DialogDescription>View agreement information and terms</DialogDescription>
          </DialogHeader>
          {selectedAgreement && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name</Label>
                  <p className="text-sm">{selectedAgreement.clientFullName}</p>
                </div>
                <div>
                  <Label>Responsible Party</Label>
                  <p className="text-sm">{selectedAgreement.responsibleParty}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedAgreement.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedAgreement.phone || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <Label>Billing Address</Label>
                  <p className="text-sm">{selectedAgreement.billingAddress}</p>
                </div>
                <div className="col-span-2">
                  <Label>Placement Option</Label>
                  <p className="text-sm font-medium">{PLACEMENT_OPTIONS[selectedAgreement.placementOption as keyof typeof PLACEMENT_OPTIONS]}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Agreement Terms</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {selectedAgreement.agreementTerms.noPrivateEmployment ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                    <span>Will not offer private employment to Agency caregivers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAgreement.agreementTerms.noReferralForPrivateHire ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                    <span>Will not refer Agency caregivers to other families</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAgreement.agreementTerms.understandUnderTablePayments ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                    <span>Understands under-the-table payments are a breach</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Penalty Acknowledgments</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {selectedAgreement.penaltyAcknowledgments.agreedToLiquidatedDamages ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                    <span>Agreed to $5,000 liquidated damages for breach</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAgreement.penaltyAcknowledgments.agreedToLegalFees ? <FileCheck className="h-4 w-4 text-green-600" /> : <Shield className="h-4 w-4 text-red-600" />}
                    <span>Agreed to pay legal and collection fees</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Electronic Signature</Label>
                  <p className="text-sm font-medium">{selectedAgreement.electronicSignature}</p>
                </div>
                <div>
                  <Label>Agreement Date</Label>
                  <p className="text-sm">{selectedAgreement.agreementDate}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label>Status</Label>
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
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Non-Solicitation Agreement</DialogTitle>
            <DialogDescription>Create a new non-solicitation and placement agreement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                <Label htmlFor="responsibleParty">Responsible Party *</Label>
                <Input
                  id="responsibleParty"
                  value={formData.responsibleParty || ""}
                  onChange={(e) => setFormData({ ...formData, responsibleParty: e.target.value })}
                  data-testid="input-responsible-party"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
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
                  value={formData.billingAddress || ""}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  data-testid="input-billing-address"
                />
              </div>
              <div className="col-span-2">
                <Label>Placement Option *</Label>
                <Select
                  value={formData.placementOption}
                  onValueChange={(value) => setFormData({ ...formData, placementOption: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-placement-option">
                    <SelectValue placeholder="Select placement option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option_a">Option A: Immediate Buyout Fee ($3,500.00)</SelectItem>
                    <SelectItem value="option_b">Option B: Transition after 300 hours + $1,500.00 Fee</SelectItem>
                    <SelectItem value="no_hire">I do not intend to hire directly (12-month non-solicitation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Agreement Terms *</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noPrivateEmployment"
                    checked={formData.agreementTerms?.noPrivateEmployment}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      agreementTerms: { ...formData.agreementTerms!, noPrivateEmployment: checked as boolean }
                    })}
                  />
                  <label htmlFor="noPrivateEmployment" className="text-sm">
                    I will not offer private employment to Agency caregivers
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noReferral"
                    checked={formData.agreementTerms?.noReferralForPrivateHire}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      agreementTerms: { ...formData.agreementTerms!, noReferralForPrivateHire: checked as boolean }
                    })}
                  />
                  <label htmlFor="noReferral" className="text-sm">
                    I will not refer Agency caregivers to other families for private hire
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="understandPayments"
                    checked={formData.agreementTerms?.understandUnderTablePayments}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      agreementTerms: { ...formData.agreementTerms!, understandUnderTablePayments: checked as boolean }
                    })}
                  />
                  <label htmlFor="understandPayments" className="text-sm">
                    I understand that &quot;under-the-table&quot; payments are a breach of contract
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Penalty Acknowledgments *</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="liquidatedDamages"
                    checked={formData.penaltyAcknowledgments?.agreedToLiquidatedDamages}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      penaltyAcknowledgments: { ...formData.penaltyAcknowledgments!, agreedToLiquidatedDamages: checked as boolean }
                    })}
                  />
                  <label htmlFor="liquidatedDamages" className="text-sm">
                    I agree that a breach will result in a $5,000 Liquidated Damages penalty
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="legalFees"
                    checked={formData.penaltyAcknowledgments?.agreedToLegalFees}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      penaltyAcknowledgments: { ...formData.penaltyAcknowledgments!, agreedToLegalFees: checked as boolean }
                    })}
                  />
                  <label htmlFor="legalFees" className="text-sm">
                    I agree to pay all legal and collection fees incurred to enforce this agreement
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="electronicSignature">Electronic Signature (Full Name) *</Label>
                <Input
                  id="electronicSignature"
                  value={formData.electronicSignature || ""}
                  onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
                  data-testid="input-signature"
                />
              </div>
              <div>
                <Label htmlFor="agreementDate">Agreement Date *</Label>
                <Input
                  id="agreementDate"
                  type="date"
                  value={formData.agreementDate || ""}
                  onChange={(e) => setFormData({ ...formData, agreementDate: e.target.value })}
                  data-testid="input-agreement-date"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
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
