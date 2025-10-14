import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  className?: string;
}

export default function FileUpload({
  value,
  onChange,
  onClear,
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  maxSize = 5 * 1024 * 1024,
  label = 'Upload Image',
  className = ''
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSize / (1024 * 1024)}MB`,
        variant: 'destructive'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await fetch('/api/upload', {
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
        description: 'Image has been uploaded'
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />

      {value ? (
        <div className="space-y-4">
          <div className="relative rounded-md overflow-hidden border">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover"
              data-testid="img-preview"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClear}
              data-testid="button-clear-upload"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            data-testid="button-change-image"
          >
            Change Image
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-md p-8 text-center cursor-pointer
            transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover-elevate'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          data-testid="dropzone-upload"
        >
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-sm">
              <span className="font-semibold text-primary">{label}</span>
              <p className="text-muted-foreground mt-1">
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF, WEBP up to {maxSize / (1024 * 1024)}MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
