import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Share2, X } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface PrintableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  formId?: string;
}

export default function PrintableFormDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  formId,
}: PrintableFormDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = () => {
    const printContent = contentRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please allow pop-ups to print this form.",
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page { margin: 0.75in; size: letter; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0066cc;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .header h1 {
              color: #0066cc;
              margin: 0 0 8px 0;
              font-size: 24px;
            }
            .header h2 {
              margin: 0 0 8px 0;
              font-size: 18px;
              font-weight: 600;
            }
            .header p {
              margin: 0;
              color: #666;
              font-size: 14px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #0066cc;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .field {
              margin-bottom: 12px;
            }
            .field-label {
              font-weight: 600;
              color: #444;
              font-size: 13px;
              margin-bottom: 4px;
            }
            .field-value {
              color: #1a1a1a;
              font-size: 14px;
              padding: 8px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            .field-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
            }
            .badge-success { background: #dcfce7; color: #166534; }
            .badge-warning { background: #fef3c7; color: #92400e; }
            .badge-info { background: #dbeafe; color: #1e40af; }
            .badge-default { background: #f3f4f6; color: #374151; }
            .footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 2px solid #0066cc;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .no-print { display: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Private InHome CareGiver</h1>
            <h2>${title}</h2>
            ${subtitle ? `<p>${subtitle}</p>` : ""}
            <p style="margin-top: 8px;">Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          ${printContent.innerHTML}
          <div class="footer">
            <p><strong>Private InHome CareGiver</strong></p>
            <p>Massachusetts In-Home Care Services</p>
            <p>info@privateinhomecaregiver.com | (617) 686-0595</p>
            ${formId ? `<p style="margin-top: 8px; font-size: 11px;">Form ID: ${formId}</p>` : ""}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownload = () => {
    handlePrint();
    toast({
      title: "Download Ready",
      description: "Use 'Save as PDF' in the print dialog to download.",
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${title} - Private InHome CareGiver`,
      text: subtitle || `Form submission from Private InHome CareGiver`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared",
          description: "Form shared successfully.",
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Link Copied",
        description: "Form link copied to clipboard.",
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link.",
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                data-testid="button-print-form"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                data-testid="button-download-form"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                data-testid="button-share-form"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4" ref={contentRef}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section mb-6">
      <h3 className="section-title text-base font-semibold text-primary border-b pb-2 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FormField({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`field mb-3 ${className}`}>
      <div className="field-label text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="field-value text-sm bg-muted/50 p-2 rounded">
        {value || <span className="text-muted-foreground italic">Not provided</span>}
      </div>
    </div>
  );
}

export function FormFieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="field-grid grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  );
}
