import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Star,
  Eye,
  Pencil,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  HelpCircle,
} from "lucide-react";
import type { Facility, FacilityFaq } from "@shared/schema";

const facilityTypeLabels: Record<string, string> = {
  "nursing-home": "Nursing Home",
  "assisted-living": "Assisted Living",
  "memory-care": "Memory Care",
  "independent-living": "Independent Living",
  "continuing-care": "Continuing Care",
};

export default function FacilitiesPage() {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isManagingFaqs, setIsManagingFaqs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: facilities, isLoading } = useQuery<Facility[]>({
    queryKey: ["/api/admin/facilities"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/facilities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/facilities"] });
      toast({
        title: "Success",
        description: "Facility deleted successfully.",
      });
      setSelectedFacility(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete facility.",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/facilities/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/facilities"] });
      toast({
        title: "Success",
        description: "Facility status updated successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update facility status.",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      draft: { variant: "outline", icon: Clock },
      published: { variant: "secondary", icon: CheckCircle },
      archived: { variant: "destructive", icon: XCircle },
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const filteredFacilities = facilities?.filter((facility) => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || facility.facilityType === typeFilter;
    const matchesStatus = statusFilter === "all" || facility.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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
    total: facilities?.length || 0,
    published: facilities?.filter((f) => f.status === "published").length || 0,
    draft: facilities?.filter((f) => f.status === "draft").length || 0,
    featured: facilities?.filter((f) => f.featured === "yes").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Facilities Directory</h1>
            <p className="text-muted-foreground mt-2">
              Manage Massachusetts senior care facilities
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} data-testid="button-add-facility">
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Facilities</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-4">
              <p className="text-2xl font-bold" data-testid="text-total-facilities">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-4">
              <p className="text-2xl font-bold text-green-600" data-testid="text-published-facilities">{stats.published}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-4">
              <p className="text-2xl font-bold text-yellow-600" data-testid="text-draft-facilities">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-4">
              <p className="text-2xl font-bold text-blue-600" data-testid="text-featured-facilities">{stats.featured}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search facilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-facilities"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="nursing-home">Nursing Homes</SelectItem>
                  <SelectItem value="assisted-living">Assisted Living</SelectItem>
                  <SelectItem value="memory-care">Memory Care</SelectItem>
                  <SelectItem value="independent-living">Independent Living</SelectItem>
                  <SelectItem value="continuing-care">Continuing Care</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFacilities?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No facilities found. Add your first facility to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFacilities?.map((facility) => (
                    <TableRow key={facility.id} data-testid={`row-facility-${facility.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{facility.name}</p>
                            {facility.featured === "yes" && (
                              <Badge variant="outline" className="text-xs">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {facilityTypeLabels[facility.facilityType] || facility.facilityType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {facility.city}, {facility.state}
                        </div>
                      </TableCell>
                      <TableCell>
                        {facility.overallRating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{facility.overallRating}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(facility.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelectedFacility(facility)}
                            data-testid={`button-view-${facility.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedFacility(facility);
                              setIsEditing(true);
                            }}
                            data-testid={`button-edit-${facility.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this facility?")) {
                                deleteMutation.mutate(facility.id);
                              }
                            }}
                            data-testid={`button-delete-${facility.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedFacility && !isEditing} onOpenChange={() => setSelectedFacility(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedFacility?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedFacility && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedFacility.status)}
                <Badge variant="secondary">
                  {facilityTypeLabels[selectedFacility.facilityType] || selectedFacility.facilityType}
                </Badge>
                {selectedFacility.featured === "yes" && <Badge>Featured</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedFacility.address}, {selectedFacility.city}, {selectedFacility.state} {selectedFacility.zipCode}
                  </p>
                </div>
                {selectedFacility.phone && (
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedFacility.phone}
                    </p>
                  </div>
                )}
                {selectedFacility.website && (
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <p className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a href={selectedFacility.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Visit Website
                      </a>
                    </p>
                  </div>
                )}
                {selectedFacility.overallRating && (
                  <div>
                    <Label className="text-muted-foreground">Rating</Label>
                    <p className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {selectedFacility.overallRating} ({selectedFacility.reviewCount} reviews)
                    </p>
                  </div>
                )}
              </div>

              {selectedFacility.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedFacility.description}</p>
                </div>
              )}

              {selectedFacility.services && selectedFacility.services.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Services</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFacility.services.map((service, i) => (
                      <Badge key={i} variant="outline">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedFacility.amenities && selectedFacility.amenities.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Amenities</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFacility.amenities.map((amenity, i) => (
                      <Badge key={i} variant="outline">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  data-testid="button-edit-facility"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsManagingFaqs(true)}
                  data-testid="button-manage-faqs"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Manage FAQs
                </Button>
                {selectedFacility.status === "draft" && (
                  <Button
                    variant="outline"
                    onClick={() => updateStatusMutation.mutate({ id: selectedFacility.id, status: "published" })}
                    data-testid="button-publish-facility"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                )}
                {selectedFacility.status === "published" && (
                  <Button
                    variant="outline"
                    onClick={() => updateStatusMutation.mutate({ id: selectedFacility.id, status: "archived" })}
                    data-testid="button-archive-facility"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FacilityFormDialog
        open={isEditing || isCreating}
        onClose={() => {
          setIsEditing(false);
          setIsCreating(false);
          setSelectedFacility(null);
        }}
        facility={isEditing ? selectedFacility : null}
      />

      {selectedFacility && (
        <FaqManagementDialog
          open={isManagingFaqs}
          onClose={() => setIsManagingFaqs(false)}
          facility={selectedFacility}
        />
      )}
    </AdminLayout>
  );
}

interface FacilityFormDialogProps {
  open: boolean;
  onClose: () => void;
  facility: Facility | null;
}

function FacilityFormDialog({ open, onClose, facility }: FacilityFormDialogProps) {
  const { toast } = useToast();
  const isEditing = !!facility;

  const [formData, setFormData] = useState({
    name: facility?.name || "",
    facilityType: facility?.facilityType || "nursing-home",
    address: facility?.address || "",
    city: facility?.city || "",
    state: facility?.state || "MA",
    zipCode: facility?.zipCode || "",
    county: facility?.county || "",
    phone: facility?.phone || "",
    website: facility?.website || "",
    email: facility?.email || "",
    description: facility?.description || "",
    shortDescription: facility?.shortDescription || "",
    services: facility?.services?.join(", ") || "",
    amenities: facility?.amenities?.join(", ") || "",
    specializations: facility?.specializations?.join(", ") || "",
    totalBeds: facility?.totalBeds?.toString() || "",
    certifiedBeds: facility?.certifiedBeds?.toString() || "",
    priceRangeMin: facility?.priceRangeMin?.toString() || "",
    priceRangeMax: facility?.priceRangeMax?.toString() || "",
    pricingNotes: facility?.pricingNotes || "",
    overallRating: facility?.overallRating || "",
    reviewCount: facility?.reviewCount?.toString() || "0",
    licenseNumber: facility?.licenseNumber || "",
    licensedBy: facility?.licensedBy || "",
    certifications: facility?.certifications?.join(", ") || "",
    healthInspectionRating: facility?.healthInspectionRating || "",
    staffingRating: facility?.staffingRating || "",
    qualityRating: facility?.qualityRating || "",
    acceptsMedicaid: facility?.acceptsMedicaid || "unknown",
    acceptsMedicare: facility?.acceptsMedicare || "unknown",
    metaTitle: facility?.metaTitle || "",
    metaDescription: facility?.metaDescription || "",
    keywords: facility?.keywords?.join(", ") || "",
    featured: facility?.featured || "no",
    sortOrder: facility?.sortOrder?.toString() || "0",
    status: facility?.status || "draft",
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/facilities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/facilities"] });
      toast({
        title: "Success",
        description: "Facility created successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create facility.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/admin/facilities/${facility?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/facilities"] });
      toast({
        title: "Success",
        description: "Facility updated successfully.",
      });
      onClose();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update facility.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      services: formData.services ? formData.services.split(",").map(s => s.trim()).filter(Boolean) : [],
      amenities: formData.amenities ? formData.amenities.split(",").map(s => s.trim()).filter(Boolean) : [],
      specializations: formData.specializations ? formData.specializations.split(",").map(s => s.trim()).filter(Boolean) : [],
      certifications: formData.certifications ? formData.certifications.split(",").map(s => s.trim()).filter(Boolean) : [],
      keywords: formData.keywords ? formData.keywords.split(",").map(s => s.trim()).filter(Boolean) : [],
      totalBeds: formData.totalBeds ? parseInt(formData.totalBeds) : null,
      certifiedBeds: formData.certifiedBeds ? parseInt(formData.certifiedBeds) : null,
      priceRangeMin: formData.priceRangeMin ? parseInt(formData.priceRangeMin) : null,
      priceRangeMax: formData.priceRangeMax ? parseInt(formData.priceRangeMax) : null,
      reviewCount: formData.reviewCount ? parseInt(formData.reviewCount) : 0,
      sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : 0,
      overallRating: formData.overallRating || null,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Facility" : "Add New Facility"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-facility-name"
                />
              </div>

              <div>
                <Label htmlFor="facilityType">Facility Type *</Label>
                <Select
                  value={formData.facilityType}
                  onValueChange={(value) => setFormData({ ...formData, facilityType: value })}
                >
                  <SelectTrigger data-testid="select-facility-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nursing-home">Nursing Home</SelectItem>
                    <SelectItem value="assisted-living">Assisted Living</SelectItem>
                    <SelectItem value="memory-care">Memory Care</SelectItem>
                    <SelectItem value="independent-living">Independent Living</SelectItem>
                    <SelectItem value="continuing-care">Continuing Care</SelectItem>
                    <SelectItem value="hospice">Hospice</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="select-facility-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief one-line description"
                  data-testid="input-facility-short-desc"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  data-testid="input-facility-description"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  data-testid="input-facility-address"
                />
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  data-testid="input-facility-city"
                />
              </div>

              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  data-testid="input-facility-zipcode"
                />
              </div>

              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  data-testid="input-facility-county"
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  data-testid="input-facility-state"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-facility-phone"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-facility-email"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-facility-website"
                />
              </div>
            </div>
          </div>

          {/* Services & Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Services & Amenities</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="services">Services (comma-separated)</Label>
                <Input
                  id="services"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder="e.g., 24-Hour Nursing, Physical Therapy, Memory Care"
                  data-testid="input-facility-services"
                />
              </div>

              <div>
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="e.g., Private Rooms, Garden, Library, Gym"
                  data-testid="input-facility-amenities"
                />
              </div>

              <div>
                <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                <Input
                  id="specializations"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  placeholder="e.g., Alzheimer's, Parkinson's, Post-surgical"
                  data-testid="input-facility-specializations"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Capacity & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalBeds">Total Beds</Label>
                <Input
                  id="totalBeds"
                  type="number"
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                  data-testid="input-facility-beds"
                />
              </div>

              <div>
                <Label htmlFor="certifiedBeds">Certified Beds</Label>
                <Input
                  id="certifiedBeds"
                  type="number"
                  value={formData.certifiedBeds}
                  onChange={(e) => setFormData({ ...formData, certifiedBeds: e.target.value })}
                  data-testid="input-facility-certified-beds"
                />
              </div>

              <div>
                <Label htmlFor="priceRangeMin">Price Min ($/month)</Label>
                <Input
                  id="priceRangeMin"
                  type="number"
                  value={formData.priceRangeMin}
                  onChange={(e) => setFormData({ ...formData, priceRangeMin: e.target.value })}
                  placeholder="e.g., 3500"
                  data-testid="input-facility-price-min"
                />
              </div>

              <div>
                <Label htmlFor="priceRangeMax">Price Max ($/month)</Label>
                <Input
                  id="priceRangeMax"
                  type="number"
                  value={formData.priceRangeMax}
                  onChange={(e) => setFormData({ ...formData, priceRangeMax: e.target.value })}
                  placeholder="e.g., 8000"
                  data-testid="input-facility-price-max"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="pricingNotes">Pricing Notes</Label>
                <Input
                  id="pricingNotes"
                  value={formData.pricingNotes}
                  onChange={(e) => setFormData({ ...formData, pricingNotes: e.target.value })}
                  placeholder="e.g., Varies by care level, Contact for details"
                  data-testid="input-facility-pricing-notes"
                />
              </div>
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Ratings & Quality</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overallRating">Overall Rating (1-5)</Label>
                <Input
                  id="overallRating"
                  value={formData.overallRating}
                  onChange={(e) => setFormData({ ...formData, overallRating: e.target.value })}
                  placeholder="e.g., 4.5"
                  data-testid="input-facility-rating"
                />
              </div>

              <div>
                <Label htmlFor="reviewCount">Review Count</Label>
                <Input
                  id="reviewCount"
                  type="number"
                  value={formData.reviewCount}
                  onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value })}
                  data-testid="input-facility-review-count"
                />
              </div>

              <div>
                <Label htmlFor="healthInspectionRating">Health Inspection Rating</Label>
                <Select
                  value={formData.healthInspectionRating}
                  onValueChange={(value) => setFormData({ ...formData, healthInspectionRating: value })}
                >
                  <SelectTrigger data-testid="select-health-rating">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not rated</SelectItem>
                    <SelectItem value="1">1 - Much below average</SelectItem>
                    <SelectItem value="2">2 - Below average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Above average</SelectItem>
                    <SelectItem value="5">5 - Much above average</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="staffingRating">Staffing Rating</Label>
                <Select
                  value={formData.staffingRating}
                  onValueChange={(value) => setFormData({ ...formData, staffingRating: value })}
                >
                  <SelectTrigger data-testid="select-staffing-rating">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not rated</SelectItem>
                    <SelectItem value="1">1 - Much below average</SelectItem>
                    <SelectItem value="2">2 - Below average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Above average</SelectItem>
                    <SelectItem value="5">5 - Much above average</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="qualityRating">Quality Rating</Label>
                <Select
                  value={formData.qualityRating}
                  onValueChange={(value) => setFormData({ ...formData, qualityRating: value })}
                >
                  <SelectTrigger data-testid="select-quality-rating">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not rated</SelectItem>
                    <SelectItem value="1">1 - Much below average</SelectItem>
                    <SelectItem value="2">2 - Below average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Above average</SelectItem>
                    <SelectItem value="5">5 - Much above average</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Insurance & Licensing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Insurance & Licensing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="acceptsMedicaid">Accepts Medicaid (MassHealth)</Label>
                <Select
                  value={formData.acceptsMedicaid}
                  onValueChange={(value) => setFormData({ ...formData, acceptsMedicaid: value })}
                >
                  <SelectTrigger data-testid="select-medicaid">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="acceptsMedicare">Accepts Medicare</Label>
                <Select
                  value={formData.acceptsMedicare}
                  onValueChange={(value) => setFormData({ ...formData, acceptsMedicare: value })}
                >
                  <SelectTrigger data-testid="select-medicare">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="licensedBy">Licensed By</Label>
                <Input
                  id="licensedBy"
                  value={formData.licensedBy}
                  onChange={(e) => setFormData({ ...formData, licensedBy: e.target.value })}
                  placeholder="e.g., MA DPH"
                  data-testid="input-facility-licensed-by"
                />
              </div>

              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  data-testid="input-facility-license"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Input
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  placeholder="e.g., Joint Commission, Medicare Certified"
                  data-testid="input-facility-certifications"
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">SEO Settings</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="Custom page title for search engines"
                  data-testid="input-facility-meta-title"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={2}
                  placeholder="Custom description for search engines (150-160 chars)"
                  data-testid="input-facility-meta-desc"
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., nursing home Boston, senior care MA"
                  data-testid="input-facility-keywords"
                />
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Display Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  placeholder="0 = default"
                  data-testid="input-facility-sort-order"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured === "yes"}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? "yes" : "no" })}
                    data-testid="checkbox-featured"
                    className="h-4 w-4"
                  />
                  <span>Featured Facility</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-facility"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FaqManagementDialogProps {
  open: boolean;
  onClose: () => void;
  facility: Facility;
}

const faqCategories = [
  "Location",
  "Contact",
  "Insurance",
  "Capacity",
  "Quality",
  "Services",
  "Amenities",
  "Care",
  "Admissions",
  "Visits",
  "Safety",
  "Emergency",
  "General",
];

function FaqManagementDialog({ open, onClose, facility }: FaqManagementDialogProps) {
  const { toast } = useToast();
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FacilityFaq | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "General",
    displayOrder: 0,
  });

  const { data: faqs, isLoading } = useQuery<FacilityFaq[]>({
    queryKey: ["/api/facilities", facility.slug, "faqs"],
    queryFn: async () => {
      const res = await fetch(`/api/facilities/${facility.slug}/faqs`);
      if (!res.ok) throw new Error("Failed to fetch FAQs");
      return res.json();
    },
    enabled: open,
  });

  const createFaqMutation = useMutation({
    mutationFn: (data: { question: string; answer: string; category: string; displayOrder: number }) =>
      apiRequest("POST", `/api/admin/facilities/${facility.id}/faqs`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facilities", facility.slug, "faqs"] });
      toast({ title: "Success", description: "FAQ created successfully." });
      setIsAddingFaq(false);
      resetForm();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create FAQ." });
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { question: string; answer: string; category: string; displayOrder: number } }) =>
      apiRequest("PATCH", `/api/admin/facility-faqs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facilities", facility.slug, "faqs"] });
      toast({ title: "Success", description: "FAQ updated successfully." });
      setEditingFaq(null);
      resetForm();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update FAQ." });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/facility-faqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facilities", facility.slug, "faqs"] });
      toast({ title: "Success", description: "FAQ deleted successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete FAQ." });
    },
  });

  const resetForm = () => {
    setFaqForm({ question: "", answer: "", category: "General", displayOrder: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaq) {
      updateFaqMutation.mutate({ id: editingFaq.id, data: faqForm });
    } else {
      createFaqMutation.mutate(faqForm);
    }
  };

  const handleEdit = (faq: FacilityFaq) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "General",
      displayOrder: faq.displayOrder || 0,
    });
    setIsAddingFaq(true);
  };

  const handleCancel = () => {
    setIsAddingFaq(false);
    setEditingFaq(null);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Manage FAQs - {facility.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {faqs?.length || 0} FAQs for this facility
            </p>
            {!isAddingFaq && (
              <Button onClick={() => setIsAddingFaq(true)} data-testid="button-add-faq">
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            )}
          </div>

          {isAddingFaq && (
            <Card>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="faq-question">Question *</Label>
                    <Input
                      id="faq-question"
                      value={faqForm.question}
                      onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                      placeholder="Enter the question"
                      required
                      data-testid="input-faq-question"
                    />
                  </div>
                  <div>
                    <Label htmlFor="faq-answer">Answer *</Label>
                    <Textarea
                      id="faq-answer"
                      value={faqForm.answer}
                      onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                      placeholder="Enter the answer"
                      rows={4}
                      required
                      data-testid="input-faq-answer"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="faq-category">Category</Label>
                      <Select
                        value={faqForm.category}
                        onValueChange={(value) => setFaqForm({ ...faqForm, category: value })}
                      >
                        <SelectTrigger data-testid="select-faq-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {faqCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="faq-display-order">Display Order</Label>
                      <Input
                        id="faq-display-order"
                        type="number"
                        value={faqForm.displayOrder}
                        onChange={(e) => setFaqForm({ ...faqForm, displayOrder: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        data-testid="input-faq-display-order"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
                      data-testid="button-save-faq"
                    >
                      {createFaqMutation.isPending || updateFaqMutation.isPending
                        ? "Saving..."
                        : editingFaq
                        ? "Update FAQ"
                        : "Create FAQ"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading FAQs...</div>
          ) : faqs && faqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-muted-foreground text-sm">{index + 1}.</span>
                      <span className="flex-1">{faq.question}</span>
                      {faq.category && (
                        <Badge variant="outline" className="ml-2">{faq.category}</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(faq)}
                          data-testid={`button-edit-faq-${faq.id}`}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this FAQ?")) {
                              deleteFaqMutation.mutate(faq.id);
                            }
                          }}
                          data-testid={`button-delete-faq-${faq.id}`}
                        >
                          <Trash2 className="h-3 w-3 mr-1 text-destructive" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No FAQs yet. Click "Add FAQ" to create one.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
