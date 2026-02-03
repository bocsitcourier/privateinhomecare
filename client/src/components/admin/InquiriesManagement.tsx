import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Inquiry } from "@shared/schema";

export default function InquiriesManagement() {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  const { data: inquiries, isLoading } = useQuery({ 
    queryKey: ["/api/admin/inquiries"],
    refetchInterval: 30000
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest("PATCH", `/api/admin/inquiries/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({ title: "Status updated" });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => 
      apiRequest("POST", `/api/admin/inquiries/${id}/replies`, { body, sentBy: "Admin" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      setReplyText("");
      setSelectedInquiry(null);
      toast({ title: "Reply sent successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/admin/inquiries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({ title: "Inquiry deleted successfully" });
    },
  });

  const handleReply = () => {
    if (selectedInquiry && replyText.trim()) {
      replyMutation.mutate({ id: selectedInquiry.id, body: replyText });
    }
  };

  const handleDelete = (inquiry: Inquiry) => {
    if (confirm(`Are you sure you want to delete the inquiry from ${inquiry.name}?`)) {
      deleteMutation.mutate(inquiry.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-chart-4';
      case 'replied': return 'bg-chart-3';
      case 'closed': return 'bg-muted';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Messages & Inquiries</h2>
        <p className="text-muted-foreground">Manage contact form submissions and replies</p>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {Array.isArray(inquiries) && inquiries.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No inquiries yet.</CardContent></Card>
          )}
          {Array.isArray(inquiries) && inquiries.map((inquiry: Inquiry) => (
            <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {inquiry.name}
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {inquiry.email} {inquiry.phone && `• ${inquiry.phone}`}
                    </div>
                    {inquiry.service && (
                      <div className="text-sm text-muted-foreground">
                        Service: {inquiry.service}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={inquiry.status} 
                      onValueChange={(value) => updateStatusMutation.mutate({ id: inquiry.id, status: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm"
                      onClick={() => setSelectedInquiry(inquiry)}
                      data-testid={`button-reply-inquiry-${inquiry.id}`}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(inquiry)}
                      data-testid={`button-delete-inquiry-${inquiry.id}`}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {inquiry.message && (
                  <div>
                    <div className="text-sm font-medium mb-1">Message:</div>
                    <p className="text-sm text-foreground/80">{inquiry.message}</p>
                  </div>
                )}
                
                {inquiry.replies && inquiry.replies.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <div className="text-sm font-medium">Replies:</div>
                    {inquiry.replies.map((reply) => (
                      <div key={reply.id} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{reply.sentBy}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{reply.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Received: {new Date(inquiry.createdAt).toLocaleString()}</div>
                  {inquiry.agreedToTerms === "yes" && inquiry.agreedToPolicy === "yes" && inquiry.agreementTimestamp && (
                    <div>Agreement Accepted: {new Date(inquiry.agreementTimestamp).toLocaleString()}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedInquiry?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={6}
                placeholder="Type your reply here..."
                data-testid="textarea-reply"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleReply} 
                className="flex-1"
                disabled={!replyText.trim() || replyMutation.isPending}
                data-testid="button-send-reply"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Reply
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedInquiry(null);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
