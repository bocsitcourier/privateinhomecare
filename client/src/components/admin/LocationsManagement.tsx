import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Pencil, Trash2, Plus, Search, Users, Building2, Eye, EyeOff } from "lucide-react";

interface MaLocation {
  id: string;
  name: string;
  slug: string;
  county: string;
  region: string | null;
  zipCodes: string[];
  population: number | null;
  isCity: string;
  isActive: string;
}

const MA_COUNTIES = [
  "Barnstable", "Berkshire", "Bristol", "Dukes", "Essex", "Franklin",
  "Hampden", "Hampshire", "Middlesex", "Nantucket", "Norfolk",
  "Plymouth", "Suffolk", "Worcester"
];

const MA_REGIONS = [
  "Greater Boston", "North Shore", "South Shore", "Cape Cod", "Cape Ann",
  "Merrimack Valley", "MetroWest", "Central Massachusetts", "Pioneer Valley",
  "Berkshires", "South Coast", "Blackstone Valley", "North Central"
];

export default function LocationsManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<MaLocation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    county: "",
    region: "",
    zipCodes: "",
    population: "",
    isCity: "no",
    isActive: "yes",
  });

  const { data: locations = [], isLoading } = useQuery<MaLocation[]>({
    queryKey: ["/api/directory/locations"],
  });

  const { data: counties = [] } = useQuery<string[]>({
    queryKey: ["/api/directory/counties"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/directory/locations", {
        ...data,
        zipCodes: data.zipCodes.split(",").map(z => z.trim()).filter(Boolean),
        population: data.population ? parseInt(data.population) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/directory/counties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/directory/regions"] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Location created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create location", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/directory/locations/${id}`, {
        ...data,
        zipCodes: data.zipCodes.split(",").map(z => z.trim()).filter(Boolean),
        population: data.population ? parseInt(data.population) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory/locations"] });
      setEditLocation(null);
      resetForm();
      toast({ title: "Location updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update location", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/directory/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/directory/counties"] });
      toast({ title: "Location deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete location", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: string }) => {
      return apiRequest("PATCH", `/api/directory/locations/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/directory/locations"] });
      toast({ title: "Location visibility updated" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      county: "",
      region: "",
      zipCodes: "",
      population: "",
      isCity: "no",
      isActive: "yes",
    });
  };

  const openEditDialog = (location: MaLocation) => {
    setEditLocation(location);
    setFormData({
      name: location.name,
      slug: location.slug,
      county: location.county,
      region: location.region || "",
      zipCodes: location.zipCodes?.join(", ") || "",
      population: location.population?.toString() || "",
      isCity: location.isCity,
      isActive: location.isActive,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editLocation) {
      updateMutation.mutate({ id: editLocation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = !searchQuery || 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.county.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCounty = countyFilter === "all" || location.county === countyFilter;
    return matchesSearch && matchesCounty;
  });

  const activeCount = locations.filter(l => l.isActive === "yes").length;
  const cityCount = locations.filter(l => l.isCity === "yes").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{locations.length}</div>
              <div className="text-sm text-muted-foreground">Total Locations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeCount}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{cityCount}</div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-full">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{counties.length}</div>
              <div className="text-sm text-muted-foreground">Counties</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Massachusetts Locations</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                  data-testid="input-location-search"
                />
              </div>
              <Select value={countyFilter} onValueChange={setCountyFilter}>
                <SelectTrigger className="w-full sm:w-40" data-testid="select-county-filter">
                  <SelectValue placeholder="All Counties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {counties.map(county => (
                    <SelectItem key={county} value={county}>{county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setIsCreateOpen(true)} data-testid="button-add-location">
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading locations...</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>County</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Population</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No locations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLocations.map(location => (
                      <TableRow key={location.id} data-testid={`row-location-${location.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {location.name}
                          </div>
                        </TableCell>
                        <TableCell>{location.county}</TableCell>
                        <TableCell>{location.region || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={location.isCity === "yes" ? "default" : "secondary"}>
                            {location.isCity === "yes" ? "City" : "Town"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {location.population?.toLocaleString() || "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({
                              id: location.id,
                              isActive: location.isActive === "yes" ? "no" : "yes"
                            })}
                            data-testid={`button-toggle-${location.id}`}
                          >
                            {location.isActive === "yes" ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(location)}
                              data-testid={`button-edit-${location.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Delete ${location.name}?`)) {
                                  deleteMutation.mutate(location.id);
                                }
                              }}
                              data-testid={`button-delete-${location.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen || !!editLocation} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditLocation(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editLocation ? "Edit Location" : "Add New Location"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="e.g., Boston"
                  required
                  data-testid="input-location-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., boston"
                  required
                  data-testid="input-location-slug"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Select
                  value={formData.county}
                  onValueChange={(v) => setFormData({ ...formData, county: v })}
                >
                  <SelectTrigger data-testid="select-location-county">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {MA_COUNTIES.map(county => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(v) => setFormData({ ...formData, region: v })}
                >
                  <SelectTrigger data-testid="select-location-region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {MA_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCodes">ZIP Codes (comma-separated)</Label>
              <Input
                id="zipCodes"
                value={formData.zipCodes}
                onChange={(e) => setFormData({ ...formData, zipCodes: e.target.value })}
                placeholder="e.g., 02101, 02108, 02109"
                data-testid="input-location-zipcodes"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="population">Population</Label>
                <Input
                  id="population"
                  type="number"
                  value={formData.population}
                  onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                  placeholder="e.g., 675647"
                  data-testid="input-location-population"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isCity">Type</Label>
                <Select
                  value={formData.isCity}
                  onValueChange={(v) => setFormData({ ...formData, isCity: v })}
                >
                  <SelectTrigger data-testid="select-location-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">City</SelectItem>
                    <SelectItem value="no">Town</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select
                  value={formData.isActive}
                  onValueChange={(v) => setFormData({ ...formData, isActive: v })}
                >
                  <SelectTrigger data-testid="select-location-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Active</SelectItem>
                    <SelectItem value="no">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditLocation(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-location"
              >
                {editLocation ? "Update" : "Create"} Location
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
