import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";

export default function JobsManagement() {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formType, setFormType] = useState("Full-time");
  const [formStatus, setFormStatus] = useState("draft");
  const { toast } = useToast();

  const { data: jobs, isLoading } = useQuery({ 
    queryKey: ["/api/admin/jobs"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/jobs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setDialogOpen(false);
      setEditingJob(null);
      toast({ title: "Job created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PATCH", `/api/admin/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setDialogOpen(false);
      setEditingJob(null);
      toast({ title: "Job updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Job deleted successfully" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/jobs/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Job published" });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/jobs/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Job unpublished" });
    },
  });

  const handleOpenDialog = (job: Job | null = null) => {
    setEditingJob(job);
    setFormType(job?.type || "Full-time");
    setFormStatus(job?.status || "draft");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      type: formType,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
      payRange: formData.get("payRange") as string,
      location: formData.get("location") as string,
      status: formStatus,
    };

    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Jobs Management</h2>
          <p className="text-muted-foreground">Create and manage job postings</p>
        </div>
        <Button onClick={() => handleOpenDialog(null)} data-testid="button-create-job">
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(jobs) && jobs.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No jobs yet. Create one to get started.</CardContent></Card>
          )}
          {Array.isArray(jobs) && jobs.map((job: Job) => (
            <Card key={job.id} data-testid={`card-job-${job.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {job.title}
                      <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">{job.type} • {job.location}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleOpenDialog(job)}
                      data-testid={`button-edit-job-${job.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => job.status === 'published' ? unpublishMutation.mutate(job.id) : publishMutation.mutate(job.id)}
                      data-testid={`button-toggle-job-${job.id}`}
                    >
                      {job.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(job.id)}
                      data-testid={`button-delete-job-${job.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{job.description}</p>
                {job.payRange && <p className="text-sm text-muted-foreground">Pay: {job.payRange}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Create Job'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" name="title" defaultValue={editingJob?.title} required />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Overnight">Overnight</SelectItem>
                  <SelectItem value="Fill-in">Fill-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={editingJob?.location || ''} placeholder="e.g., Newton, MA" />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" defaultValue={editingJob?.description} rows={4} required />
            </div>
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" name="requirements" defaultValue={editingJob?.requirements || ''} rows={3} />
            </div>
            <div>
              <Label htmlFor="payRange">Pay Range</Label>
              <Input id="payRange" name="payRange" defaultValue={editingJob?.payRange || ''} placeholder="e.g., $22/hr" />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingJob ? 'Update' : 'Create'} Job
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
