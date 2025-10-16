import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, X, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PageMeta } from "@shared/schema";
import FileUpload from "@/components/FileUpload";

export default function PageMetaManagement() {
  const [editingPage, setEditingPage] = useState<PageMeta | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const { data: pages, isLoading } = useQuery({ 
    queryKey: ["/api/admin/pages"],
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/pages/seed", {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ 
        title: "Pages Seeded",
        description: `Created ${data.created} new page metadata entries (${data.total} total pages checked)`,
      });
    },
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/admin/pages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      setDialogOpen(false);
      setEditingPage(null);
      setKeywords([]);
      toast({ title: "Page metadata saved successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => apiRequest("DELETE", `/api/admin/pages/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ title: "Page metadata deleted" });
    },
  });

  const handleOpenDialog = (page?: PageMeta) => {
    if (page) {
      setEditingPage(page);
      setKeywords(page.keywords || []);
      setOgImageUrl(page.ogImageUrl || '');
    } else {
      setEditingPage(null);
      setKeywords([]);
      setOgImageUrl('');
    }
    setDialogOpen(true);
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      ...(editingPage?.id ? { id: editingPage.id } : {}),
      pageSlug: formData.get("pageSlug") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      ogTitle: formData.get("ogTitle") as string,
      ogDescription: formData.get("ogDescription") as string,
      ogImageUrl,
      keywords,
    };

    upsertMutation.mutate(data);
  };

  const filteredPages = Array.isArray(pages) ? pages.filter((page: PageMeta) => {
    if (activeTab === "all") return true;
    if (activeTab === "cities") return page.pageSlug.startsWith("city-");
    if (activeTab === "main") return !page.pageSlug.startsWith("city-");
    return true;
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center md:justify-between md:flex-row flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold">SEO & Page Metadata</h2>
          <p className="text-muted-foreground">Manage meta tags and SEO settings for pages</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => seedMutation.mutate()} 
            disabled={seedMutation.isPending}
            variant="outline"
            data-testid="button-seed-pages"
          >
            <Database className="w-4 h-4 mr-2" />
            {seedMutation.isPending ? "Seeding..." : "Seed Pages"}
          </Button>
          <Button onClick={() => handleOpenDialog()} data-testid="button-create-page-meta">
            <Plus className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All Pages ({Array.isArray(pages) ? pages.length : 0})</TabsTrigger>
            <TabsTrigger value="main" data-testid="tab-main">
              Main Pages ({Array.isArray(pages) ? pages.filter((p: PageMeta) => !p.pageSlug.startsWith("city-")).length : 0})
            </TabsTrigger>
            <TabsTrigger value="cities" data-testid="tab-cities">
              City Pages ({Array.isArray(pages) ? pages.filter((p: PageMeta) => p.pageSlug.startsWith("city-")).length : 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredPages.length === 0 && (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No page metadata found. Click "Seed Pages" to initialize.</CardContent></Card>
            )}
            {filteredPages.map((page: PageMeta) => (
            <Card key={page.id} data-testid={`card-page-${page.pageSlug}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      /{page.pageSlug}
                    </CardTitle>
                    <div className="text-sm font-medium">{page.title}</div>
                    {page.description && (
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleOpenDialog(page)}
                      data-testid={`button-edit-page-${page.pageSlug}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(page.pageSlug)}
                      data-testid={`button-delete-page-${page.pageSlug}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {page.keywords && page.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground mr-2">Keywords:</span>
                    {page.keywords.map(kw => (
                      <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page Metadata' : 'Add Page Metadata'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pageSlug">Page Slug *</Label>
              <Input 
                id="pageSlug" 
                name="pageSlug" 
                defaultValue={editingPage?.pageSlug} 
                placeholder="home, about, services..." 
                required 
                disabled={!!editingPage}
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL path identifier (e.g., "home" for homepage)
              </p>
            </div>

            <div>
              <Label htmlFor="title">Page Title *</Label>
              <Input 
                id="title" 
                name="title" 
                defaultValue={editingPage?.title} 
                required 
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">60 chars max - appears in browser tab and search results</p>
            </div>

            <div>
              <Label htmlFor="description">Meta Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={editingPage?.description || ''} 
                rows={3} 
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">160 chars max - appears in search results</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Open Graph (Social Media)</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ogTitle">OG Title</Label>
                  <Input id="ogTitle" name="ogTitle" defaultValue={editingPage?.ogTitle || ''} />
                </div>

                <div>
                  <Label htmlFor="ogDescription">OG Description</Label>
                  <Textarea id="ogDescription" name="ogDescription" defaultValue={editingPage?.ogDescription || ''} rows={2} />
                </div>

                <div>
                  <Label htmlFor="ogImageUrl">OG Image</Label>
                  <FileUpload 
                    value={ogImageUrl}
                    onChange={setOgImageUrl}
                    label="Upload OG Image"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Keywords</Label>
              <div className="flex gap-2 mb-2">
                <Input 
                  value={keywordInput} 
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  placeholder="Add keyword..."
                />
                <Button type="button" onClick={handleAddKeyword} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {keywords.map(kw => (
                  <Badge key={kw} variant="secondary" className="gap-1">
                    {kw}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveKeyword(kw)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={upsertMutation.isPending}>
                Save Metadata
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
