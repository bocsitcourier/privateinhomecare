import { useState, useRef } from 'react';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  label?: string;
  className?: string;
}

export default function ResumeUpload({
  value,
  onChange,
  onClear,
  label = 'Upload Resume',
  className = ''
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json() as { url: string };
      onChange(data.url);
      toast({
        title: 'Upload successful',
        description: 'Resume has been uploaded'
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload resume',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'resume';
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx"
        className="hidden"
        data-testid="input-resume-file"
      />

      {value ? (
        <div className="relative border rounded-md p-4 bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getFileName(value)}</p>
              <p className="text-xs text-muted-foreground">Resume uploaded</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="flex-shrink-0"
              data-testid="button-clear-resume"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-md p-6 
            transition-colors cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          data-testid="dropzone-resume"
        >
          <div className="flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">{label}</p>
                <p className="text-xs text-muted-foreground">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
