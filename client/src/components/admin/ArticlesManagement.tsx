import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Eye, EyeOff, X, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";
import FileUpload from "@/components/FileUpload";
import type { Article, ArticleFaq } from "@shared/schema";

interface FaqEntry {
  id?: string;
  question: string;
  answer: string;
  displayOrder: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

export default function ArticlesManagement() {
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
  const [bodyContent, setBodyContent] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Care Tips");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [showFaqSection, setShowFaqSection] = useState(false);
  const { toast} = useToast();

  const { data: articleFaqs } = useQuery<ArticleFaq[]>({
    queryKey: ["/api/articles", editingArticle?.id, "faqs"],
    queryFn: async () => {
      if (!editingArticle?.id) return [];
      const response = await fetch(`/api/articles/${editingArticle.id}/faqs`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!editingArticle?.id && dialogOpen,
  });

  useEffect(() => {
    if (articleFaqs) {
      setFaqs(articleFaqs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        displayOrder: faq.displayOrder,
      })));
    }
  }, [articleFaqs]);

  const { data: articles, isLoading } = useQuery({ 
    queryKey: ["/api/admin/articles"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setDialogOpen(false);
      setEditingArticle(null);
      setKeywords([]);
      toast({ title: "Article created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create article", 
        description: error.message || "An error occurred while creating the article",
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PATCH", `/api/admin/articles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setDialogOpen(false);
      setEditingArticle(null);
      setKeywords([]);
      toast({ title: "Article updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update article", 
        description: error.message || "An error occurred while updating the article",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete article", 
        description: error.message || "An error occurred while deleting the article",
        variant: "destructive"
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/articles/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article published" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to publish article", 
        description: error.message || "An error occurred while publishing the article",
        variant: "destructive"
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/articles/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "Article unpublished" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to unpublish article", 
        description: error.message || "An error occurred while unpublishing the article",
        variant: "destructive"
      });
    },
  });

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setKeywords(article.keywords || []);
      setFormStatus(article.status);
      setBodyContent(article.body);
      setTitle(article.title);
      setSlug(article.slug);
      setCategory(article.category || "Care Tips");
      setHeroImageUrl(article.heroImageUrl || '');
      setShowFaqSection(true);
    } else {
      setEditingArticle(null);
      setKeywords([]);
      setFormStatus("draft");
      setBodyContent("");
      setTitle("");
      setSlug("");
      setCategory("Care Tips");
      setHeroImageUrl('');
      setFaqs([]);
      setShowFaqSection(false);
    }
    setDialogOpen(true);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, {
      question: "",
      answer: "",
      displayOrder: faqs.length,
      isNew: true,
    }]);
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
    setFaqs(updatedFaqs);
  };

  const handleRemoveFaq = (index: number) => {
    const faq = faqs[index];
    if (faq.id) {
      const updatedFaqs = [...faqs];
      updatedFaqs[index] = { ...faq, isDeleted: true };
      setFaqs(updatedFaqs);
    } else {
      setFaqs(faqs.filter((_, i) => i !== index));
    }
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;
    
    const updatedFaqs = [...faqs];
    [updatedFaqs[index], updatedFaqs[newIndex]] = [updatedFaqs[newIndex], updatedFaqs[index]];
    updatedFaqs.forEach((faq, i) => {
      faq.displayOrder = i;
    });
    setFaqs(updatedFaqs);
  };

  const saveFaqs = async (articleId: string) => {
    for (const faq of faqs) {
      if (faq.isDeleted && faq.id) {
        await apiRequest("DELETE", `/api/admin/articles/faqs/${faq.id}`);
      } else if (faq.isNew && faq.question && faq.answer) {
        await apiRequest("POST", `/api/admin/articles/${articleId}/faqs`, {
          question: faq.question,
          answer: faq.answer,
          displayOrder: faq.displayOrder,
          isActive: 'yes',
        });
      } else if (faq.id && !faq.isDeleted) {
        await apiRequest("PATCH", `/api/admin/articles/faqs/${faq.id}`, {
          question: faq.question,
          answer: faq.answer,
          displayOrder: faq.displayOrder,
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["/api/articles", articleId, "faqs"] });
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!editingArticle) {
      setSlug(generateSlug(newTitle));
    }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      title,
      slug,
      category,
      excerpt: (e.currentTarget.elements.namedItem("excerpt") as HTMLTextAreaElement).value,
      body: bodyContent,
      heroImageUrl,
      metaTitle: (e.currentTarget.elements.namedItem("metaTitle") as HTMLInputElement).value,
      metaDescription: (e.currentTarget.elements.namedItem("metaDescription") as HTMLTextAreaElement).value,
      keywords,
      status: formStatus,
    };

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data }, {
        onSuccess: async () => {
          await saveFaqs(editingArticle.id);
        }
      });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Articles Management</h2>
          <p className="text-muted-foreground">Create and manage blog articles with SEO optimization</p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-create-article">
          <Plus className="w-4 h-4 mr-2" />
          Create Article
        </Button>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(articles) && articles.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No articles yet. Create one to get started.</CardContent></Card>
          )}
          {Array.isArray(articles) && articles.map((article: Article) => (
            <Card key={article.id} data-testid={`card-article-${article.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {article.title}
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status}
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">/{article.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleOpenDialog(article)}
                      data-testid={`button-edit-article-${article.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => article.status === 'published' ? unpublishMutation.mutate(article.id) : publishMutation.mutate(article.id)}
                      data-testid={`button-toggle-article-${article.id}`}
                    >
                      {article.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(article.id)}
                      data-testid={`button-delete-article-${article.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {article.excerpt && <p className="text-sm text-muted-foreground mb-2">{article.excerpt}</p>}
                {article.keywords && article.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.keywords.map(kw => (
                      <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Create Article'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={title}
                    onChange={handleTitleChange}
                    required 
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input 
                    id="slug" 
                    name="slug" 
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    required 
                    data-testid="input-slug"
                    placeholder="article-url-slug"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Will appear as: /{slug || 'article-url-slug'}</p>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Care Guides">Care Guides</SelectItem>
                      <SelectItem value="Care Tips">Care Tips</SelectItem>
                      <SelectItem value="Dementia Care">Dementia Care</SelectItem>
                      <SelectItem value="Caregiver Support">Caregiver Support</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Financial Planning">Financial Planning</SelectItem>
                      <SelectItem value="Legal Planning">Legal Planning</SelectItem>
                      <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                      <SelectItem value="Family Resources">Family Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea id="excerpt" name="excerpt" defaultValue={editingArticle?.excerpt || ''} rows={3} />
                </div>
                <div>
                  <Label htmlFor="heroImageUrl">Hero Image</Label>
                  <FileUpload 
                    value={heroImageUrl}
                    onChange={setHeroImageUrl}
                    label="Upload Hero Image"
                  />
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
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input id="metaTitle" name="metaTitle" defaultValue={editingArticle?.metaTitle || ''} maxLength={60} />
                  <p className="text-xs text-muted-foreground mt-1">60 chars max for SEO</p>
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea id="metaDescription" name="metaDescription" defaultValue={editingArticle?.metaDescription || ''} rows={3} maxLength={160} />
                  <p className="text-xs text-muted-foreground mt-1">160 chars max for SEO</p>
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
              </div>
            </div>
            
            <div>
              <Label>Article Body *</Label>
              <RichTextEditor 
                content={bodyContent} 
                onChange={setBodyContent}
                placeholder="Write your article content..."
              />
            </div>

            {editingArticle && (
              <div className="border rounded-lg p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowFaqSection(!showFaqSection)}
                  data-testid="toggle-faq-section"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <Label className="cursor-pointer font-semibold">
                      Frequently Asked Questions ({faqs.filter(f => !f.isDeleted).length})
                    </Label>
                  </div>
                  {showFaqSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                
                {showFaqSection && (
                  <div className="mt-4 space-y-4">
                    {faqs.filter(faq => !faq.isDeleted).map((faq, index) => (
                      <div key={faq.id || `new-${index}`} className="border rounded-md p-3 space-y-3 bg-muted/30">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">FAQ #{index + 1}</span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleMoveFaq(faqs.indexOf(faq), 'up')}
                              disabled={index === 0}
                              data-testid={`button-faq-up-${index}`}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleMoveFaq(faqs.indexOf(faq), 'down')}
                              disabled={index === faqs.filter(f => !f.isDeleted).length - 1}
                              data-testid={`button-faq-down-${index}`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveFaq(faqs.indexOf(faq))}
                              data-testid={`button-faq-remove-${index}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`faq-q-${index}`}>Question</Label>
                          <Input
                            id={`faq-q-${index}`}
                            value={faq.question}
                            onChange={(e) => handleUpdateFaq(faqs.indexOf(faq), 'question', e.target.value)}
                            placeholder="Enter the question..."
                            data-testid={`input-faq-question-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`faq-a-${index}`}>Answer</Label>
                          <Textarea
                            id={`faq-a-${index}`}
                            value={faq.answer}
                            onChange={(e) => handleUpdateFaq(faqs.indexOf(faq), 'answer', e.target.value)}
                            placeholder="Enter the answer..."
                            rows={3}
                            data-testid={`input-faq-answer-${index}`}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddFaq}
                      className="w-full"
                      data-testid="button-add-faq"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add FAQ
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingArticle ? 'Update' : 'Create'} Article
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
