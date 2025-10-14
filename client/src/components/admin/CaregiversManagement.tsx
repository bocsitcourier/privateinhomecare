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
import { Plus, Edit, Trash2, Eye, EyeOff, X, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import type { Caregiver } from "@shared/schema";

export default function CaregiversManagement() {
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certificationInput, setCertificationInput] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [formStatus, setFormStatus] = useState("active");
  const [formAvailability, setFormAvailability] = useState("Full-time");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const { toast } = useToast();

  const { data: caregivers, isLoading } = useQuery({ 
    queryKey: ["/api/admin/caregivers"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/caregivers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/caregivers"] });
      setDialogOpen(false);
      setEditingCaregiver(null);
      setCertifications([]);
      setSpecialties([]);
      toast({ title: "Caregiver profile created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PATCH", `/api/admin/caregivers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/caregivers"] });
      setDialogOpen(false);
      setEditingCaregiver(null);
      setCertifications([]);
      setSpecialties([]);
      toast({ title: "Caregiver profile updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/caregivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/caregivers"] });
      toast({ title: "Caregiver profile deleted successfully" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/caregivers/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/caregivers"] });
      toast({ title: "Caregiver profile published" });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/caregivers/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/caregivers"] });
      toast({ title: "Caregiver profile unpublished" });
    },
  });

  const handleOpenDialog = (caregiver?: Caregiver) => {
    if (caregiver) {
      setEditingCaregiver(caregiver);
      setCertifications(caregiver.certifications || []);
      setSpecialties(caregiver.specialties || []);
      setFormStatus(caregiver.status);
      setFormAvailability(caregiver.availability);
      setPhotoUrl(caregiver.photoUrl || "");
    } else {
      setEditingCaregiver(null);
      setCertifications([]);
      setSpecialties([]);
      setFormStatus("active");
      setFormAvailability("Full-time");
      setPhotoUrl("");
    }
    setDialogOpen(true);
  };

  const handleAddCertification = () => {
    if (certificationInput.trim() && !certifications.includes(certificationInput.trim())) {
      setCertifications([...certifications, certificationInput.trim()]);
      setCertificationInput("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
      setSpecialties([...specialties, specialtyInput.trim()]);
      setSpecialtyInput("");
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      photoUrl: photoUrl || null,
      bio: formData.get("bio") as string,
      yearsExperience: parseInt(formData.get("yearsExperience") as string),
      certifications,
      specialties,
      hourlyRate: parseInt(formData.get("hourlyRate") as string),
      location: formData.get("location") as string,
      availability: formAvailability,
      status: formStatus,
    };

    if (editingCaregiver) {
      updateMutation.mutate({ id: editingCaregiver.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Caregivers Management</h2>
          <p className="text-muted-foreground">Create and manage caregiver profiles</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-create-caregiver">
          <Plus className="w-4 h-4 mr-2" />
          Create Caregiver Profile
        </Button>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(caregivers) && caregivers.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No caregiver profiles yet. Create one to get started.</CardContent></Card>
          )}
          {Array.isArray(caregivers) && caregivers.map((caregiver: Caregiver) => (
            <Card key={caregiver.id} data-testid={`card-caregiver-${caregiver.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {caregiver.photoUrl && (
                      <img 
                        src={caregiver.photoUrl} 
                        alt={caregiver.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {caregiver.name}
                        <Badge className={caregiver.status === 'active' ? 'bg-chart-3' : 'bg-muted'}>
                          {caregiver.status}
                        </Badge>
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {caregiver.location} • ${caregiver.hourlyRate}/hr • {caregiver.yearsExperience} years experience
                      </div>
                      <div className="text-sm text-muted-foreground">{caregiver.availability}</div>
                      {caregiver.certifications && caregiver.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {caregiver.certifications.map((cert) => (
                            <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleOpenDialog(caregiver)}
                      data-testid={`button-edit-caregiver-${caregiver.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => caregiver.status === 'active' ? unpublishMutation.mutate(caregiver.id) : publishMutation.mutate(caregiver.id)}
                      data-testid={`button-toggle-caregiver-${caregiver.id}`}
                    >
                      {caregiver.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(caregiver.id)}
                      data-testid={`button-delete-caregiver-${caregiver.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80">{caregiver.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCaregiver ? 'Edit Caregiver Profile' : 'Create Caregiver Profile'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" defaultValue={editingCaregiver?.name} required data-testid="input-caregiver-name" />
            </div>
            
            <div>
              <Label>Profile Photo</Label>
              <FileUpload
                value={photoUrl}
                onChange={setPhotoUrl}
                accept="image/*"
                label="Upload profile photo or drag and drop"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio *</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                rows={4}
                defaultValue={editingCaregiver?.bio} 
                placeholder="Tell families about your experience and approach to caregiving..."
                required
                data-testid="textarea-bio"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="yearsExperience">Years Experience *</Label>
                <Input 
                  id="yearsExperience" 
                  name="yearsExperience" 
                  type="number"
                  min="0"
                  defaultValue={editingCaregiver?.yearsExperience} 
                  required 
                  data-testid="input-years-experience"
                />
              </div>
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                <Input 
                  id="hourlyRate" 
                  name="hourlyRate" 
                  type="number"
                  min="0"
                  defaultValue={editingCaregiver?.hourlyRate} 
                  required 
                  data-testid="input-hourly-rate"
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input id="location" name="location" defaultValue={editingCaregiver?.location} required data-testid="input-location" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availability">Availability *</Label>
                <Select value={formAvailability} onValueChange={setFormAvailability}>
                  <SelectTrigger data-testid="select-availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Weekends">Weekends</SelectItem>
                    <SelectItem value="Overnight">Overnight</SelectItem>
                    <SelectItem value="Live-in">Live-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Certifications</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={certificationInput}
                  onChange={(e) => setCertificationInput(e.target.value)}
                  placeholder="e.g., CPR, CNA, RN"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
                  data-testid="input-certification"
                />
                <Button type="button" onClick={handleAddCertification} data-testid="button-add-certification">Add</Button>
              </div>
              {certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="gap-1" data-testid={`badge-cert-${cert}`}>
                      {cert}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveCertification(cert)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Specialties</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  placeholder="e.g., Dementia Care, Alzheimer's, Mobility Assistance"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                  data-testid="input-specialty"
                />
                <Button type="button" onClick={handleAddSpecialty} data-testid="button-add-specialty">Add</Button>
              </div>
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="gap-1" data-testid={`badge-specialty-${specialty}`}>
                      {specialty}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveSpecialty(specialty)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-caregiver">
                {editingCaregiver ? 'Update' : 'Create'} Caregiver Profile
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
