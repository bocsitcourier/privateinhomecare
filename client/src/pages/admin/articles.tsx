import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";
import { FileText, Edit, Eye, Search, CheckCircle, Clock, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  category?: string;
  author?: string;
  heroImageUrl?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export default function ArticlesPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editForm, setEditForm] = useState<Partial<Article>>({});
  const { toast } = useToast();

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Article> }) =>
      apiRequest("PATCH", `/api/admin/articles/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Success",
        description: "Article updated successfully.",
      });
      setSelectedArticle(null);
      setIsEditing(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update article.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Success",
        description: "Article deleted successfully.",
      });
      setSelectedArticle(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete article.",
      });
    },
  });

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

  const handleEdit = (article: Article) => {
    setEditForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      body: article.body,
      category: article.category,
      author: article.author,
      heroImageUrl: article.heroImageUrl,
      status: article.status,
    });
    setSelectedArticle(article);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedArticle) {
      updateMutation.mutate({ id: selectedArticle.id, updates: editForm });
    }
  };

  const handleView = (article: Article) => {
    setSelectedArticle(article);
    setIsEditing(false);
  };

  const getWordCount = (body: string | undefined) => {
    if (!body) return 0;
    const textContent = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return textContent.split(' ').filter(w => w.length > 0).length;
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

  const categories = Array.from(new Set(articles?.map(a => a.category).filter(Boolean)));
  
  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: articles?.length || 0,
    published: articles?.filter((a) => a.status === "published").length || 0,
    draft: articles?.filter((a) => a.status === "draft").length || 0,
    avgWords: Math.round((articles?.reduce((sum, a) => sum + getWordCount(a.body), 0) || 0) / (articles?.length || 1)),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Articles Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and edit all {stats.total} articles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-articles">{stats.total}</div>
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
                Avg. Word Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-words">{stats.avgWords}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Articles
              </CardTitle>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full md:w-64"
                    data-testid="input-search"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-40" data-testid="select-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat || "uncategorized"}>
                        {cat || "Uncategorized"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles?.map((article) => (
                    <TableRow key={article.id} data-testid={`row-article-${article.id}`}>
                      <TableCell className="font-medium max-w-md">
                        <div className="truncate" title={article.title}>
                          {article.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          /{article.slug}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.category || "—"}</Badge>
                      </TableCell>
                      <TableCell>{getWordCount(article.body).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>
                        {article.createdAt
                          ? format(new Date(article.createdAt), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(article)}
                            data-testid={`button-view-${article.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(article)}
                            data-testid={`button-edit-${article.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredArticles?.length || 0} of {stats.total} articles
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedArticle && !isEditing} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedArticle?.title}</DialogTitle>
              <DialogDescription>
                /{selectedArticle?.slug} • {getWordCount(selectedArticle?.body).toLocaleString()} words
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {selectedArticle?.category && (
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                )}
                {selectedArticle && getStatusBadge(selectedArticle.status)}
              </div>
              {selectedArticle?.heroImageUrl && (
                <img 
                  src={selectedArticle.heroImageUrl} 
                  alt={selectedArticle.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              {selectedArticle?.excerpt && (
                <div>
                  <Label className="text-sm font-medium">Excerpt</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedArticle.excerpt}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Content Preview</Label>
                <div 
                  className="prose prose-sm max-w-none mt-2 p-4 bg-muted/50 rounded-lg max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedArticle?.body?.substring(0, 2000) + '...' || '' }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                Close
              </Button>
              <Button onClick={() => selectedArticle && handleEdit(selectedArticle)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditing} onOpenChange={() => { setIsEditing(false); setSelectedArticle(null); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Article</DialogTitle>
              <DialogDescription>
                Make changes to the article content and metadata
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    data-testid="input-edit-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={editForm.slug || ''}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    data-testid="input-edit-slug"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    data-testid="input-edit-category"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={editForm.author || ''}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    data-testid="input-edit-author"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={editForm.status || 'draft'} 
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger data-testid="select-edit-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroImageUrl">Hero Image URL</Label>
                <Input
                  id="heroImageUrl"
                  value={editForm.heroImageUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, heroImageUrl: e.target.value })}
                  data-testid="input-edit-image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={editForm.excerpt || ''}
                  onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                  rows={3}
                  data-testid="textarea-edit-excerpt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">
                  Body Content ({getWordCount(editForm.body).toLocaleString()} words)
                </Label>
                <Textarea
                  id="body"
                  value={editForm.body || ''}
                  onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  data-testid="textarea-edit-body"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                variant="destructive" 
                onClick={() => selectedArticle && deleteMutation.mutate(selectedArticle.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); setSelectedArticle(null); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                data-testid="button-save-article"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
