import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Download, KeyRound, Shield, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function AdminProfile() {
  const { toast } = useToast();
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordForm) =>
      apiRequest("PATCH", "/api/admin/profile/password", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully. Please login again.",
      });
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to change password",
      });
    },
  });

  const generateCodesMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/admin/profile/recovery-codes"),
    onSuccess: (data: any) => {
      setRecoveryCodes(data.codes || []);
      toast({
        title: "Success",
        description: "Recovery codes generated. Save them in a secure location!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate recovery codes",
      });
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  const downloadCodes = () => {
    const blob = new Blob(
      [
        "RECOVERY CODES - KEEP THESE SAFE!\n\n",
        "These codes can be used to reset your password if you forget it.\n",
        "Each code can only be used once.\n\n",
        recoveryCodes.join("\n"),
        "\n\nGenerated: " + new Date().toLocaleString(),
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your password and recovery codes
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        data-testid="input-current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password (min 8 characters)"
                        data-testid="input-new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        data-testid="input-confirm-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                data-testid="button-change-password"
              >
                {changePasswordMutation.isPending
                  ? "Changing Password..."
                  : "Change Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Recovery Codes</CardTitle>
          </div>
          <CardDescription>
            Generate recovery codes to reset your password if you forget it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Recovery codes are one-time use codes that can reset your password.
              Store them in a secure location like a password manager. Generating
              new codes will invalidate any existing codes.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => generateCodesMutation.mutate()}
            disabled={generateCodesMutation.isPending}
            variant="outline"
            data-testid="button-generate-codes"
          >
            {generateCodesMutation.isPending
              ? "Generating..."
              : "Generate New Recovery Codes"}
          </Button>

          {recoveryCodes && recoveryCodes.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Your Recovery Codes</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadCodes}
                    data-testid="button-download-codes"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {recoveryCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-background p-2 rounded border"
                      data-testid={`code-${index}`}
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Save these codes now! They won't be shown again. Each code can
                  only be used once.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
