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
import { Video, Edit, Eye, Search, CheckCircle, Clock, Trash2, Plus, Play, Upload, Globe, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Video as VideoType, videoCategoryEnum } from "@shared/schema";

const VIDEO_CATEGORIES = [
  { value: "care-tips", label: "Care Tips" },
  { value: "caregiver-training", label: "Caregiver Training" },
  { value: "family-support", label: "Family Support" },
  { value: "health-conditions", label: "Health Conditions" },
  { value: "massachusetts-resources", label: "Massachusetts Resources" },
  { value: "testimonials", label: "Testimonials" },
  { value: "company-news", label: "Company News" },
];

const VIDEO_TYPES = [
  { value: "upload", label: "Uploaded Video" },
  { value: "youtube", label: "YouTube" },
  { value: "vimeo", label: "Vimeo" },
];

export default function AdminVideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editForm, setEditForm] = useState<Partial<VideoType>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();

  const { data: videos, isLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/videos"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<VideoType>) =>
      apiRequest("POST", "/api/admin/videos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video created successfully.",
      });
      setIsCreating(false);
      setEditForm({});
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to create video.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<VideoType> }) =>
      apiRequest("PATCH", `/api/admin/videos/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video updated successfully.",
      });
      setSelectedVideo(null);
      setIsEditing(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update video.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video deleted successfully.",
      });
      setSelectedVideo(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete video.",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/admin/videos/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video published successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish video.",
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/admin/videos/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video unpublished successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unpublish video.",
      });
    },
  });

  const handleGenerateAIMetadata = async (videoId: string) => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch(`/api/admin/videos/${videoId}/generate-metadata`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate metadata");
      }
      
      const metadata = await response.json();
      
      setEditForm(prev => ({
        ...prev,
        metaTitle: metadata.metaTitle || prev.metaTitle,
        metaDescription: metadata.metaDescription || prev.metaDescription,
        keywords: metadata.keywords || prev.keywords,
        topics: metadata.topics || prev.topics,
        targetAudience: metadata.targetAudience || prev.targetAudience,
        learningObjectives: metadata.learningObjectives || prev.learningObjectives,
        schemaMarkup: metadata.schemaMarkup ? JSON.stringify(metadata.schemaMarkup, null, 2) : prev.schemaMarkup,
      }));
      
      toast({
        title: "AI Metadata Generated",
        description: "SEO metadata has been generated. Review and save to apply.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate AI metadata.",
      });
    } finally {
      setIsGeneratingAI(false);
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

  const handleEdit = (video: VideoType) => {
    setEditForm({
      title: video.title,
      slug: video.slug,
      description: video.description || "",
      category: video.category,
      videoType: video.videoType,
      videoUrl: video.videoUrl || "",
      embedUrl: video.embedUrl || "",
      thumbnailUrl: video.thumbnailUrl || "",
      duration: video.duration || 0,
      transcript: video.transcript || "",
      speakerName: video.speakerName || "",
      speakerTitle: video.speakerTitle || "",
      topics: video.topics || [],
      targetAudience: video.targetAudience || "",
      learningObjectives: video.learningObjectives || [],
      metaTitle: video.metaTitle || "",
      metaDescription: video.metaDescription || "",
      keywords: video.keywords || [],
      canonicalUrl: video.canonicalUrl || "",
      featured: video.featured,
      sortOrder: video.sortOrder,
      status: video.status,
    });
    setSelectedVideo(video);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditForm({
      title: "",
      description: "",
      category: "care-tips",
      videoType: "upload",
      videoUrl: "",
      embedUrl: "",
      thumbnailUrl: "",
      duration: 0,
      transcript: "",
      speakerName: "",
      speakerTitle: "",
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
    } else if (selectedVideo) {
      updateMutation.mutate({ id: selectedVideo.id, updates: editForm });
    }
  };

  const handleView = (video: VideoType) => {
    setSelectedVideo(video);
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
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const filteredVideos = videos?.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: videos?.length || 0,
    published: videos?.filter((v) => v.status === "published").length || 0,
    draft: videos?.filter((v) => v.status === "draft").length || 0,
    featured: videos?.filter((v) => v.featured === "yes").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Videos Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage and edit all {stats.total} videos
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="button-add-video">
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-videos">{stats.total}</div>
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
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-videos"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {VIDEO_CATEGORIES.map((cat) => (
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
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos?.map((video) => (
                  <TableRow key={video.id} data-testid={`row-video-${video.id}`}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {video.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {VIDEO_CATEGORIES.find(c => c.value === video.category)?.label || video.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{video.videoType}</TableCell>
                    <TableCell>{formatDuration(video.duration || 0)}</TableCell>
                    <TableCell>{getStatusBadge(video.status)}</TableCell>
                    <TableCell>
                      {video.featured === "yes" ? (
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
                          onClick={() => handleView(video)}
                          data-testid={`button-view-video-${video.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(video)}
                          data-testid={`button-edit-video-${video.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {video.status === "draft" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => publishMutation.mutate(video.id)}
                            data-testid={`button-publish-video-${video.id}`}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => unpublishMutation.mutate(video.id)}
                            data-testid={`button-unpublish-video-${video.id}`}
                          >
                            <Clock className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this video?")) {
                              deleteMutation.mutate(video.id);
                            }
                          }}
                          data-testid={`button-delete-video-${video.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVideos?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No videos found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedVideo && !isEditing} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              Video details and metadata
            </DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p>{VIDEO_CATEGORIES.find(c => c.value === selectedVideo.category)?.label}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="capitalize">{selectedVideo.videoType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p>{formatDuration(selectedVideo.duration || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Views</Label>
                  <p>{selectedVideo.viewCount}</p>
                </div>
              </div>
              {selectedVideo.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{selectedVideo.description}</p>
                </div>
              )}
              {selectedVideo.speakerName && (
                <div>
                  <Label className="text-muted-foreground">Speaker</Label>
                  <p className="mt-1">{selectedVideo.speakerName} {selectedVideo.speakerTitle && `- ${selectedVideo.speakerTitle}`}</p>
                </div>
              )}
              {selectedVideo.topics && selectedVideo.topics.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Topics</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVideo.topics.map((topic, i) => (
                      <Badge key={i} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedVideo.metaTitle && (
                <div>
                  <Label className="text-muted-foreground">SEO Title</Label>
                  <p className="mt-1">{selectedVideo.metaTitle}</p>
                </div>
              )}
              {selectedVideo.metaDescription && (
                <div>
                  <Label className="text-muted-foreground">SEO Description</Label>
                  <p className="mt-1">{selectedVideo.metaDescription}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVideo(null)}>
              Close
            </Button>
            <Button onClick={() => handleEdit(selectedVideo!)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing || isCreating} onOpenChange={() => { setIsEditing(false); setIsCreating(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add New Video" : "Edit Video"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "Create a new video entry" : "Update video details and SEO metadata"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content & AI</TabsTrigger>
              <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    data-testid="input-video-title"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={editForm.slug || ""}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    placeholder="Auto-generated from title if empty"
                    data-testid="input-video-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editForm.category || "care-tips"}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger data-testid="select-video-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="videoType">Video Type</Label>
                  <Select
                    value={editForm.videoType || "upload"}
                    onValueChange={(value) => setEditForm({ ...editForm, videoType: value })}
                  >
                    <SelectTrigger data-testid="select-video-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {editForm.videoType === "upload" && (
                  <div className="col-span-2">
                    <Label htmlFor="videoUrl">Video URL (Upload)</Label>
                    <Input
                      id="videoUrl"
                      value={editForm.videoUrl || ""}
                      onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                      placeholder="/videos/my-video.mp4"
                      data-testid="input-video-url"
                    />
                  </div>
                )}
                {editForm.videoType !== "upload" && (
                  <div className="col-span-2">
                    <Label htmlFor="embedUrl">Embed URL</Label>
                    <Input
                      id="embedUrl"
                      value={editForm.embedUrl || ""}
                      onChange={(e) => setEditForm({ ...editForm, embedUrl: e.target.value })}
                      placeholder="https://www.youtube.com/embed/..."
                      data-testid="input-embed-url"
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input
                    id="thumbnailUrl"
                    value={editForm.thumbnailUrl || ""}
                    onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                    data-testid="input-thumbnail-url"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editForm.duration || 0}
                    onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                    data-testid="input-video-duration"
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
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    data-testid="textarea-video-description"
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
                    <Label htmlFor="featured">Featured Video</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editForm.status || "draft"}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger data-testid="select-video-status">
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
            
            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="speakerName">Speaker Name</Label>
                  <Input
                    id="speakerName"
                    value={editForm.speakerName || ""}
                    onChange={(e) => setEditForm({ ...editForm, speakerName: e.target.value })}
                    data-testid="input-speaker-name"
                  />
                </div>
                <div>
                  <Label htmlFor="speakerTitle">Speaker Title/Credentials</Label>
                  <Input
                    id="speakerTitle"
                    value={editForm.speakerTitle || ""}
                    onChange={(e) => setEditForm({ ...editForm, speakerTitle: e.target.value })}
                    placeholder="e.g., RN, Care Specialist"
                    data-testid="input-speaker-title"
                  />
                </div>
                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={editForm.targetAudience || ""}
                    onChange={(e) => setEditForm({ ...editForm, targetAudience: e.target.value })}
                    placeholder="e.g., Family caregivers, seniors"
                    data-testid="input-target-audience"
                  />
                </div>
                <div>
                  <Label htmlFor="topics">Topics (comma-separated)</Label>
                  <Input
                    id="topics"
                    value={(editForm.topics || []).join(", ")}
                    onChange={(e) => setEditForm({ ...editForm, topics: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                    placeholder="dementia care, home safety, medication"
                    data-testid="input-topics"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="learningObjectives">Learning Objectives (comma-separated)</Label>
                  <Input
                    id="learningObjectives"
                    value={(editForm.learningObjectives || []).join(", ")}
                    onChange={(e) => setEditForm({ ...editForm, learningObjectives: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                    placeholder="Understand care options, Learn safety tips"
                    data-testid="input-learning-objectives"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="transcript">Transcript (for AI search indexing)</Label>
                  <Textarea
                    id="transcript"
                    value={editForm.transcript || ""}
                    onChange={(e) => setEditForm({ ...editForm, transcript: e.target.value })}
                    rows={8}
                    placeholder="Full transcript of the video for AI search and accessibility..."
                    data-testid="textarea-transcript"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-4">
              {isEditing && selectedVideo && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          AI-Powered SEO Optimization
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Generate optimized metadata, keywords, and schema markup using AI
                        </p>
                      </div>
                      <Button
                        onClick={() => handleGenerateAIMetadata(String(selectedVideo.id))}
                        disabled={isGeneratingAI}
                        data-testid="button-generate-ai-metadata"
                      >
                        {isGeneratingAI ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate AI Metadata
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                    placeholder="home care, massachusetts, senior care"
                    data-testid="input-keywords"
                  />
                </div>
                <div>
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={editForm.canonicalUrl || ""}
                    onChange={(e) => setEditForm({ ...editForm, canonicalUrl: e.target.value })}
                    placeholder="https://privateinhomecaregiver.com/videos/..."
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
                        placeholder='{"@context": "https://schema.org", "@type": "VideoObject", ...}'
                        className="font-mono text-sm"
                        data-testid="textarea-schema-markup"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter valid JSON-LD for custom structured data. Leave empty for auto-generated VideoObject schema.
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
              data-testid="button-save-video"
            >
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
