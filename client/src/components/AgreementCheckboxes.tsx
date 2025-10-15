import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { Link } from "wouter";

interface AgreementCheckboxesProps {
  form: UseFormReturn<any>;
}

export function AgreementCheckboxes({ form }: AgreementCheckboxesProps) {
  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="agreedToTerms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                data-testid="checkbox-terms"
                checked={field.value === "yes"}
                onCheckedChange={(checked) => field.onChange(checked ? "yes" : "no")}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label
                htmlFor="agreedToTerms"
                className="text-sm font-medium cursor-pointer"
                data-testid="label-terms"
              >
                I agree to the{" "}
                <Link href="/terms-of-service" className="text-primary hover:underline" data-testid="link-terms">
                  Terms of Service
                </Link>
              </label>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="agreedToPolicy"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                data-testid="checkbox-policy"
                checked={field.value === "yes"}
                onCheckedChange={(checked) => field.onChange(checked ? "yes" : "no")}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label
                htmlFor="agreedToPolicy"
                className="text-sm font-medium cursor-pointer"
                data-testid="label-policy"
              >
                I agree to the{" "}
                <Link href="/privacy-policy" className="text-primary hover:underline" data-testid="link-policy">
                  Privacy Policy
                </Link>
              </label>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
