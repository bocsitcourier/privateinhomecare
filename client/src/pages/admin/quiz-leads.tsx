import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  Search,
  Eye,
  Trash2,
  TrendingUp,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import type { QuizLead, QuizLeadWithResponses } from "@shared/schema";

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  qualified: { label: "Qualified", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  converted: { label: "Converted", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
};

const URGENCY_CONFIG = {
  immediate: { label: "Immediate", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  high: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  low: { label: "Low", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

export function QuizLeadsManagementContent() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<QuizLeadWithResponses | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: leads = [], isLoading } = useQuery<QuizLead[]>({
    queryKey: ["/api/admin/quiz-leads"],
  });

  const { data: stats } = useQuery<{ total: number; new: number; contacted: number; qualified: number; converted: number }>({
    queryKey: ["/api/admin/quiz-leads/stats"],
  });

  const fetchLeadDetails = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("GET", `/api/admin/quiz-leads/${id}`);
      return response.json() as Promise<QuizLeadWithResponses>;
    },
    onSuccess: (data) => {
      setSelectedLead(data);
      setNotes(data.notes || "");
      setIsViewModalOpen(true);
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuizLead> }) => {
      const response = await apiRequest("PATCH", `/api/admin/quiz-leads/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quiz-leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quiz-leads/stats"] });
      toast({ title: "Lead updated successfully" });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/quiz-leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quiz-leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quiz-leads/stats"] });
      setIsViewModalOpen(false);
      toast({ title: "Lead deleted successfully" });
    },
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery));
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, status: string) => {
    updateLeadMutation.mutate({ id, data: { status } });
  };

  const handleSaveNotes = () => {
    if (selectedLead) {
      updateLeadMutation.mutate({ id: selectedLead.id, data: { notes } });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" data-testid="text-page-title">Quiz Leads Management</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.new || 0}</p>
                  <p className="text-sm text-muted-foreground">New</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Phone className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.contacted || 0}</p>
                  <p className="text-sm text-muted-foreground">Contacted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.qualified || 0}</p>
                  <p className="text-sm text-muted-foreground">Qualified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.converted || 0}</p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {lead.leadScore}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.urgencyLevel && (
                          <Badge className={URGENCY_CONFIG[lead.urgencyLevel as keyof typeof URGENCY_CONFIG]?.color || ""}>
                            {URGENCY_CONFIG[lead.urgencyLevel as keyof typeof URGENCY_CONFIG]?.label || lead.urgencyLevel}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead.id, value)}
                        >
                          <SelectTrigger className="w-[130px]" data-testid={`select-status-${lead.id}`}>
                            <Badge className={STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG]?.color || ""}>
                              {STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG]?.label || lead.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(lead.createdAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fetchLeadDetails.mutate(lead.id)}
                            disabled={fetchLeadDetails.isPending}
                            data-testid={`button-view-${lead.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this lead?")) {
                                deleteLeadMutation.mutate(lead.id);
                              }
                            }}
                            data-testid={`button-delete-${lead.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* View Lead Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedLead.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lead Score</p>
                  <p className="font-medium">{selectedLead.leadScore}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  {selectedLead.urgencyLevel && (
                    <Badge className={URGENCY_CONFIG[selectedLead.urgencyLevel as keyof typeof URGENCY_CONFIG]?.color || ""}>
                      {URGENCY_CONFIG[selectedLead.urgencyLevel as keyof typeof URGENCY_CONFIG]?.label || selectedLead.urgencyLevel}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quiz</p>
                  <p className="font-medium">{selectedLead.quiz?.title || "Unknown"}</p>
                </div>
              </div>

              {selectedLead.responses && selectedLead.responses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Quiz Responses</h4>
                  <div className="space-y-3">
                    {selectedLead.responses.map((response, index) => (
                      <div key={response.id} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-1">
                          {index + 1}. {response.question?.questionText}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {response.answerValue || response.answerText || response.answerValues?.join(", ") || "No answer"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  className="min-h-[100px]"
                  data-testid="input-notes"
                />
                <Button 
                  onClick={handleSaveNotes} 
                  className="mt-2"
                  disabled={updateLeadMutation.isPending}
                  data-testid="button-save-notes"
                >
                  Save Notes
                </Button>
              </div>

              {selectedLead.sourcePage && (
                <div>
                  <p className="text-sm text-muted-foreground">Source Page</p>
                  <p className="text-sm break-all">{selectedLead.sourcePage}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminQuizLeadsPage() {
  return (
    <AdminLayout>
      <QuizLeadsManagementContent />
    </AdminLayout>
  );
}
