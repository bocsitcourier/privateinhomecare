import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { format } from "date-fns";
import { Headphones, Edit, Eye, Search, CheckCircle, Clock, Trash2, Plus, Mic, Globe, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Podcast as PodcastType, podcastCategoryEnum } from "@shared/schema";

const PODCAST_CATEGORIES = [
  { value: "caregiver-stories", label: "Caregiver Stories" },
  { value: "expert-interviews", label: "Expert Interviews" },
  { value: "family-conversations", label: "Family Conversations" },
  { value: "health-topics", label: "Health Topics" },
  { value: "massachusetts-care", label: "Massachusetts Care" },
  { value: "tips-and-advice", label: "Tips and Advice" },
];

const AUDIO_TYPES = [
  { value: "upload", label: "Uploaded Audio" },
  { value: "spotify", label: "Spotify" },
  { value: "apple", label: "Apple Podcasts" },
  { value: "anchor", label: "Anchor" },
];

export function PodcastsManagementContent() {
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editForm, setEditForm] = useState<Partial<PodcastType>>({});
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const { toast } = useToast();

  const { data: podcasts, isLoading } = useQuery<PodcastType[]>({
    queryKey: ["/api/podcasts"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<PodcastType>) =>
      apiRequest("POST", "/api/admin/podcasts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      toast({
        title: "Success",
        description: "Podcast created successfully.",
      });
      setIsCreating(false);
      setEditForm({});
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to create podcast.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<PodcastType> }) =>
      apiRequest("PATCH", `/api/admin/podcasts/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      toast({
        title: "Success",
        description: "Podcast updated successfully.",
      });
      setSelectedPodcast(null);
      setIsEditing(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update podcast.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/podcasts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      toast({
        title: "Success",
        description: "Podcast deleted successfully.",
      });
      setSelectedPodcast(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete podcast.",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/admin/podcasts/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      toast({
        title: "Success",
        description: "Podcast published successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish podcast.",
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/admin/podcasts/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      toast({
        title: "Success",
        description: "Podcast unpublished successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unpublish podcast.",
      });
    },
  });

  const handleGenerateThumbnail = async (podcastId: string) => {
    setIsGeneratingThumbnail(true);
    try {
      const response = await fetch(`/api/admin/podcasts/${podcastId}/generate-thumbnail`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate thumbnail");
      }
      
      const result = await response.json();
      
      setEditForm(prev => ({
        ...prev,
        thumbnailUrl: result.thumbnailUrl,
      }));
      
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      
      toast({
        title: "Thumbnail Generated",
        description: "AI thumbnail has been created and saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate thumbnail.",
      });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      published: { variant: "default", icon: CheckCircle },
      draft: { variant: "outline", icon: Clock },
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

  const handleEdit = (podcast: PodcastType) => {
    setEditForm({
      title: podcast.title,
      slug: podcast.slug,
      description: podcast.description || "",
      category: podcast.category,
      audioType: podcast.audioType,
      audioUrl: podcast.audioUrl || "",
      embedUrl: podcast.embedUrl || "",
      thumbnailUrl: podcast.thumbnailUrl || "",
      episodeNumber: podcast.episodeNumber || undefined,
      seasonNumber: podcast.seasonNumber || undefined,
      duration: podcast.duration || 0,
      showNotes: podcast.showNotes || "",
      transcript: podcast.transcript || "",
      hostName: podcast.hostName || "",
      guestName: podcast.guestName || "",
      guestTitle: podcast.guestTitle || "",
      topics: podcast.topics || [],
      targetAudience: podcast.targetAudience || "",
      learningObjectives: podcast.learningObjectives || [],
      metaTitle: podcast.metaTitle || "",
      metaDescription: podcast.metaDescription || "",
      keywords: podcast.keywords || [],
      canonicalUrl: podcast.canonicalUrl || "",
      featured: podcast.featured,
      sortOrder: podcast.sortOrder,
      status: podcast.status,
    });
    setSelectedPodcast(podcast);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditForm({
      title: "",
      description: "",
      category: "tips-and-advice",
      audioType: "upload",
      audioUrl: "",
      embedUrl: "",
      thumbnailUrl: "",
      episodeNumber: undefined,
      seasonNumber: undefined,
      duration: 0,
      showNotes: "",
      transcript: "",
      hostName: "",
      guestName: "",
      guestTitle: "",
      topics: [],
      targetAudience: "",
      learningObjectives: [],
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      canonicalUrl: "",
      featured: "no",
      sortOrder: 0,
      status: "draft",
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (isCreating) {
      createMutation.mutate(editForm);
    } else if (selectedPodcast) {
      updateMutation.mutate({ id: selectedPodcast.id, updates: editForm });
    }
  };

  const handleView = (podcast: PodcastType) => {
    setSelectedPodcast(podcast);
    setIsEditing(false);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredPodcasts = podcasts?.filter(podcast => {
    const matchesSearch = podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          podcast.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || podcast.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: podcasts?.length || 0,
    published: podcasts?.filter((p) => p.status === "published").length || 0,
    draft: podcasts?.filter((p) => p.status === "draft").length || 0,
    featured: podcasts?.filter((p) => p.featured === "yes").length || 0,
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Podcasts Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage and edit all {stats.total} podcasts
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="button-add-podcast">
            <Plus className="h-4 w-4 mr-2" />
            Add Podcast
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Podcasts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-podcasts">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-published-count">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-draft-count">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Featured
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-featured-count">{stats.featured}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search podcasts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-podcasts"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PODCAST_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Episode</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPodcasts?.map((podcast) => (
                  <TableRow key={podcast.id} data-testid={`row-podcast-${podcast.id}`}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {podcast.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {PODCAST_CATEGORIES.find(c => c.value === podcast.category)?.label || podcast.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {podcast.seasonNumber && podcast.episodeNumber
                        ? `S${podcast.seasonNumber}E${podcast.episodeNumber}`
                        : podcast.episodeNumber
                        ? `Ep. ${podcast.episodeNumber}`
                        : "-"}
                    </TableCell>
                    <TableCell>{formatDuration(podcast.duration || 0)}</TableCell>
                    <TableCell>{getStatusBadge(podcast.status)}</TableCell>
                    <TableCell>
                      {podcast.featured === "yes" ? (
                        <Badge variant="default">Featured</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(podcast)}
                          data-testid={`button-view-podcast-${podcast.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(podcast)}
                          data-testid={`button-edit-podcast-${podcast.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {podcast.status === "draft" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => publishMutation.mutate(podcast.id)}
                            data-testid={`button-publish-podcast-${podcast.id}`}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => unpublishMutation.mutate(podcast.id)}
                            data-testid={`button-unpublish-podcast-${podcast.id}`}
                          >
                            <Clock className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this podcast?")) {
                              deleteMutation.mutate(podcast.id);
                            }
                          }}
                          data-testid={`button-delete-podcast-${podcast.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPodcasts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No podcasts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      <Dialog open={!!selectedPodcast && !isEditing} onOpenChange={() => setSelectedPodcast(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPodcast?.title}</DialogTitle>
            <DialogDescription>
              Podcast details and metadata
            </DialogDescription>
          </DialogHeader>
          {selectedPodcast && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p>{PODCAST_CATEGORIES.find(c => c.value === selectedPodcast.category)?.label}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="capitalize">{selectedPodcast.audioType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p>{formatDuration(selectedPodcast.duration || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Plays</Label>
                  <p>{selectedPodcast.playCount}</p>
                </div>
              </div>
              {selectedPodcast.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{selectedPodcast.description}</p>
                </div>
              )}
              {(selectedPodcast.hostName || selectedPodcast.guestName) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedPodcast.hostName && (
                    <div>
                      <Label className="text-muted-foreground">Host</Label>
                      <p className="mt-1">{selectedPodcast.hostName}</p>
                    </div>
                  )}
                  {selectedPodcast.guestName && (
                    <div>
                      <Label className="text-muted-foreground">Guest</Label>
                      <p className="mt-1">{selectedPodcast.guestName} {selectedPodcast.guestTitle && `- ${selectedPodcast.guestTitle}`}</p>
                    </div>
                  )}
                </div>
              )}
              {selectedPodcast.topics && selectedPodcast.topics.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Topics</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPodcast.topics.map((topic, i) => (
                      <Badge key={i} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedPodcast.metaTitle && (
                <div>
                  <Label className="text-muted-foreground">SEO Title</Label>
                  <p className="mt-1">{selectedPodcast.metaTitle}</p>
                </div>
              )}
              {selectedPodcast.metaDescription && (
                <div>
                  <Label className="text-muted-foreground">SEO Description</Label>
                  <p className="mt-1">{selectedPodcast.metaDescription}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPodcast(null)}>
              Close
            </Button>
            <Button onClick={() => handleEdit(selectedPodcast!)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing || isCreating} onOpenChange={() => { setIsEditing(false); setIsCreating(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add New Podcast" : "Edit Podcast"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "Create a new podcast episode" : "Update podcast details and SEO metadata"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="episode">Episode</TabsTrigger>
              <TabsTrigger value="content">Content & AI</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    data-testid="input-podcast-title"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={editForm.slug || ""}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    placeholder="Auto-generated from title if empty"
                    data-testid="input-podcast-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editForm.category || "tips-and-advice"}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger data-testid="select-podcast-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PODCAST_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="audioType">Audio Type</Label>
                  <Select
                    value={editForm.audioType || "upload"}
                    onValueChange={(value) => setEditForm({ ...editForm, audioType: value })}
                  >
                    <SelectTrigger data-testid="select-audio-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIO_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {editForm.audioType === "upload" && (
                  <div className="col-span-2">
                    <Label htmlFor="audioUrl">Audio URL (Upload)</Label>
                    <Input
                      id="audioUrl"
                      value={editForm.audioUrl || ""}
                      onChange={(e) => setEditForm({ ...editForm, audioUrl: e.target.value })}
                      placeholder="/podcasts/episode-1.mp3"
                      data-testid="input-audio-url"
                    />
                  </div>
                )}
                {editForm.audioType !== "upload" && (
                  <div className="col-span-2">
                    <Label htmlFor="embedUrl">Embed URL</Label>
                    <Input
                      id="embedUrl"
                      value={editForm.embedUrl || ""}
                      onChange={(e) => setEditForm({ ...editForm, embedUrl: e.target.value })}
                      placeholder="https://open.spotify.com/embed/..."
                      data-testid="input-embed-url"
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="thumbnailUrl"
                      value={editForm.thumbnailUrl || ""}
                      onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                      placeholder="Enter URL or generate with AI"
                      data-testid="input-thumbnail-url"
                      className="flex-1"
                    />
                    {isEditing && selectedPodcast && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleGenerateThumbnail(String(selectedPodcast.id))}
                        disabled={isGeneratingThumbnail}
                        data-testid="button-generate-thumbnail"
                      >
                        {isGeneratingThumbnail ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Thumbnail
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {editForm.thumbnailUrl && (
                    <div className="mt-2">
                      <img 
                        src={editForm.thumbnailUrl} 
                        alt="Thumbnail preview" 
                        className="h-20 w-auto rounded border"
                      />
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    data-testid="textarea-podcast-description"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={editForm.featured === "yes"}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, featured: checked ? "yes" : "no" })}
                      data-testid="switch-featured"
                    />
                    <Label htmlFor="featured">Featured Podcast</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editForm.status || "draft"}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger data-testid="select-podcast-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="episode" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seasonNumber">Season Number</Label>
                  <Input
                    id="seasonNumber"
                    type="number"
                    value={editForm.seasonNumber || ""}
                    onChange={(e) => setEditForm({ ...editForm, seasonNumber: parseInt(e.target.value) || undefined })}
                    data-testid="input-season-number"
                  />
                </div>
                <div>
                  <Label htmlFor="episodeNumber">Episode Number</Label>
                  <Input
                    id="episodeNumber"
                    type="number"
                    value={editForm.episodeNumber || ""}
                    onChange={(e) => setEditForm({ ...editForm, episodeNumber: parseInt(e.target.value) || undefined })}
                    data-testid="input-episode-number"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editForm.duration || 0}
                    onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                    data-testid="input-podcast-duration"
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={editForm.sortOrder || 0}
                    onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                    data-testid="input-sort-order"
                  />
                </div>
                <div>
                  <Label htmlFor="hostName">Host Name</Label>
                  <Input
                    id="hostName"
                    value={editForm.hostName || ""}
                    onChange={(e) => setEditForm({ ...editForm, hostName: e.target.value })}
                    data-testid="input-host-name"
                  />
                </div>
                <div>
                  <Label htmlFor="guestName">Guest Name</Label>
                  <Input
                    id="guestName"
                    value={editForm.guestName || ""}
                    onChange={(e) => setEditForm({ ...editForm, guestName: e.target.value })}
                    data-testid="input-guest-name"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="guestTitle">Guest Title/Credentials</Label>
                  <Input
                    id="guestTitle"
                    value={editForm.guestTitle || ""}
                    onChange={(e) => setEditForm({ ...editForm, guestTitle: e.target.value })}
                    placeholder="e.g., RN, Geriatric Care Specialist"
                    data-testid="input-guest-title"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="showNotes">Show Notes</Label>
                  <Textarea
                    id="showNotes"
                    value={editForm.showNotes || ""}
                    onChange={(e) => setEditForm({ ...editForm, showNotes: e.target.value })}
                    rows={5}
                    placeholder="Episode summary, links mentioned, timestamps..."
                    data-testid="textarea-show-notes"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={editForm.targetAudience || ""}
                    onChange={(e) => setEditForm({ ...editForm, targetAudience: e.target.value })}
                    placeholder="e.g., Family caregivers, healthcare professionals"
                    data-testid="input-target-audience"
                  />
                </div>
                <div>
                  <Label htmlFor="topics">Topics (comma-separated)</Label>
                  <Input
                    id="topics"
                    value={(editForm.topics || []).join(", ")}
                    onChange={(e) => setEditForm({ ...editForm, topics: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                    placeholder="dementia care, caregiver burnout"
                    data-testid="input-topics"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="learningObjectives">Learning Objectives (comma-separated)</Label>
                  <Input
                    id="learningObjectives"
                    value={(editForm.learningObjectives || []).join(", ")}
                    onChange={(e) => setEditForm({ ...editForm, learningObjectives: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                    placeholder="Understand care options, Learn communication techniques"
                    data-testid="input-learning-objectives"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="transcript">Transcript (for AI search indexing)</Label>
                  <Textarea
                    id="transcript"
                    value={editForm.transcript || ""}
                    onChange={(e) => setEditForm({ ...editForm, transcript: e.target.value })}
                    rows={10}
                    placeholder="Full transcript of the podcast episode for AI search and accessibility..."
                    data-testid="textarea-transcript"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="metaTitle">SEO Title</Label>
                  <Input
                    id="metaTitle"
                    value={editForm.metaTitle || ""}
                    onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                    placeholder="Optimized title for search engines (50-60 chars)"
                    data-testid="input-meta-title"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(editForm.metaTitle || "").length}/60 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="metaDescription">SEO Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={editForm.metaDescription || ""}
                    onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                    rows={3}
                    placeholder="Description for search results (150-160 chars)"
                    data-testid="textarea-meta-description"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(editForm.metaDescription || "").length}/160 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={(editForm.keywords || []).join(", ")}
                    onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean) })}
                    placeholder="home care podcast, massachusetts elder care"
                    data-testid="input-keywords"
                  />
                </div>
                <div>
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={editForm.canonicalUrl || ""}
                    onChange={(e) => setEditForm({ ...editForm, canonicalUrl: e.target.value })}
                    placeholder="https://privateinhomecaregiver.com/podcasts/..."
                    data-testid="input-canonical-url"
                  />
                </div>
                <Accordion type="single" collapsible>
                  <AccordionItem value="schema">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Custom Schema Markup (JSON-LD)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Textarea
                        value={editForm.schemaMarkup ? JSON.stringify(editForm.schemaMarkup, null, 2) : ""}
                        onChange={(e) => {
                          try {
                            const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                            setEditForm({ ...editForm, schemaMarkup: parsed });
                          } catch {
                          }
                        }}
                        rows={10}
                        placeholder='{"@context": "https://schema.org", "@type": "PodcastEpisode", ...}'
                        className="font-mono text-sm"
                        data-testid="textarea-schema-markup"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter valid JSON-LD for custom structured data. Leave empty for auto-generated PodcastEpisode schema.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditing(false); setIsCreating(false); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-podcast"
            >
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Podcast"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPodcastsPage() {
  return (
    <AdminLayout>
      <PodcastsManagementContent />
    </AdminLayout>
  );
}
