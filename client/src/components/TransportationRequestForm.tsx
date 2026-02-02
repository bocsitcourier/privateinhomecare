import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import ReCAPTCHA from "react-google-recaptcha";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, Send, Car, Accessibility } from "lucide-react";

interface TransportationRequestFormProps {
  city?: string;
  className?: string;
}

const TRANSPORT_OPTIONS = [
  { value: "medical_appointments", label: "Medical Appointments" },
  { value: "dialysis", label: "Dialysis Transportation" },
  { value: "shopping", label: "Shopping & Errands" },
  { value: "social", label: "Social Events & Activities" },
  { value: "business", label: "Business & Appointments" },
  { value: "recreational", label: "Recreational & Leisure" },
];

const DAY_OPTIONS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const FREQUENCY_OPTIONS = [
  { value: "one_time", label: "One-Time Trip" },
  { value: "weekly", label: "Weekly" },
  { value: "multiple_weekly", label: "Multiple Times Per Week" },
  { value: "bi_weekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "as_needed", label: "As Needed" },
];

const TIME_OPTIONS = [
  { value: "early_morning", label: "Early Morning (6am - 9am)" },
  { value: "morning", label: "Morning (9am - 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm - 5pm)" },
  { value: "evening", label: "Evening (5pm - 8pm)" },
  { value: "flexible", label: "Flexible" },
];

const MOBILITY_AIDS = [
  { value: "none", label: "None" },
  { value: "cane", label: "Cane" },
  { value: "walker", label: "Walker" },
  { value: "rollator", label: "Rollator" },
  { value: "manual_wheelchair", label: "Manual Wheelchair" },
  { value: "power_wheelchair", label: "Power Wheelchair" },
  { value: "scooter", label: "Mobility Scooter" },
  { value: "oxygen", label: "Portable Oxygen" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "self", label: "Self" },
  { value: "spouse", label: "Spouse" },
  { value: "adult_child", label: "Adult Child" },
  { value: "other_family", label: "Other Family Member" },
  { value: "friend", label: "Friend" },
  { value: "professional", label: "Professional (Care Manager, Social Worker, etc.)" },
];

const REFERRAL_OPTIONS = [
  { value: "google", label: "Google Search" },
  { value: "referral", label: "Friend or Family Referral" },
  { value: "doctor", label: "Doctor or Healthcare Provider" },
  { value: "dialysis_center", label: "Dialysis Center" },
  { value: "hospital", label: "Hospital Discharge Planner" },
  { value: "social_worker", label: "Social Worker" },
  { value: "other", label: "Other" },
];

export default function TransportationRequestForm({ city, className }: TransportationRequestFormProps) {
  const { toast } = useToast();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const [formData, setFormData] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    relationshipToSenior: "",
    seniorName: "",
    seniorAge: "",
    seniorCity: city || "",
    transportTypes: [] as string[],
    primaryDestination: "",
    frequency: "",
    preferredDays: [] as string[],
    preferredTimeOfDay: "",
    wheelchairAccessible: "",
    mobilityAids: [] as string[],
    specialAccommodations: "",
    regularAppointments: "",
    startDate: "",
    additionalNotes: "",
    howHeardAboutUs: "",
  });

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData & { captchaToken: string }) => {
      const response = await apiRequest("POST", "/api/forms/transportation-request", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Request Submitted Successfully",
        description: "Our transportation coordinator will contact you within 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or call us directly.",
        variant: "destructive",
      });
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTransportToggle = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      transportTypes: prev.transportTypes.includes(type)
        ? prev.transportTypes.filter((t) => t !== type)
        : [...prev.transportTypes, type],
    }));
  };

  const handleMobilityToggle = (aid: string) => {
    setFormData((prev) => ({
      ...prev,
      mobilityAids: prev.mobilityAids.includes(aid)
        ? prev.mobilityAids.filter((a) => a !== aid)
        : [...prev.mobilityAids, aid],
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contactName || !formData.contactEmail || !formData.contactPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required contact fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.seniorName || !formData.seniorCity) {
      toast({
        title: "Missing Information",
        description: "Please provide the senior's name and city.",
        variant: "destructive",
      });
      return;
    }

    if (formData.transportTypes.length === 0) {
      toast({
        title: "Transportation Type Required",
        description: "Please select at least one type of transportation you need.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms || !agreedToPolicy) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the Terms of Service and Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    if (!captchaToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({ ...formData, captchaToken });
  };

  if (submitted) {
    return (
      <Card className={className}>
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-4">
            Your transportation request has been received. Our transportation coordinator 
            will contact you within 24 hours to discuss your needs and schedule.
          </p>
          <p className="text-sm text-muted-foreground">
            Need immediate assistance? Call us at{" "}
            <a href="tel:+16176860595" className="text-primary font-semibold">
              (617) 686-0595
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Car className="w-6 h-6 text-primary" />
          <CardTitle>Request Transportation Services</CardTitle>
        </div>
        <CardDescription>
          Fill out this form to receive a personalized consultation about our senior transportation services.
          {city && ` Serving ${city}, Massachusetts.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b pb-2">Contact Information</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Your Name *</Label>
                <Input
                  id="contactName"
                  data-testid="input-transport-contact-name"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  data-testid="input-transport-contact-email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  data-testid="input-transport-contact-phone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationshipToSenior">Relationship to Passenger</Label>
                <Select
                  value={formData.relationshipToSenior}
                  onValueChange={(value) => handleInputChange("relationshipToSenior", value)}
                >
                  <SelectTrigger data-testid="select-transport-relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b pb-2">Passenger Information</h4>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="seniorName">Passenger's Name *</Label>
                <Input
                  id="seniorName"
                  data-testid="input-transport-senior-name"
                  value={formData.seniorName}
                  onChange={(e) => handleInputChange("seniorName", e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seniorAge">Age (optional)</Label>
                <Input
                  id="seniorAge"
                  type="number"
                  data-testid="input-transport-senior-age"
                  value={formData.seniorAge}
                  onChange={(e) => handleInputChange("seniorAge", e.target.value)}
                  placeholder="65"
                  min="55"
                  max="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seniorCity">City *</Label>
                <Input
                  id="seniorCity"
                  data-testid="input-transport-senior-city"
                  value={formData.seniorCity}
                  onChange={(e) => handleInputChange("seniorCity", e.target.value)}
                  placeholder="Boston, MA"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b pb-2">Transportation Needs *</h4>
            <p className="text-sm text-muted-foreground">Select all types of transportation you need:</p>
            
            <div className="grid gap-3 md:grid-cols-2">
              {TRANSPORT_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    data-testid={`checkbox-transport-${option.value}`}
                    checked={formData.transportTypes.includes(option.value)}
                    onCheckedChange={() => handleTransportToggle(option.value)}
                  />
                  <Label htmlFor={option.value} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryDestination">Primary Destination (optional)</Label>
              <Input
                id="primaryDestination"
                data-testid="input-primary-destination"
                value={formData.primaryDestination}
                onChange={(e) => handleInputChange("primaryDestination", e.target.value)}
                placeholder="e.g., Mass General Hospital, Dialysis Center name, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regularAppointments">Regular Appointment Details (optional)</Label>
              <Textarea
                id="regularAppointments"
                data-testid="textarea-regular-appointments"
                value={formData.regularAppointments}
                onChange={(e) => handleInputChange("regularAppointments", e.target.value)}
                placeholder="e.g., Dialysis every Mon/Wed/Fri at 8am at Fresenius Kidney Care..."
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b pb-2">Scheduling Preferences</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="frequency">Trip Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleInputChange("frequency", value)}
                >
                  <SelectTrigger data-testid="select-transport-frequency">
                    <SelectValue placeholder="How often do you need rides?" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTimeOfDay">Preferred Pickup Time</Label>
                <Select
                  value={formData.preferredTimeOfDay}
                  onValueChange={(value) => handleInputChange("preferredTimeOfDay", value)}
                >
                  <SelectTrigger data-testid="select-transport-time">
                    <SelectValue placeholder="Preferred time of day" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Days (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={formData.preferredDays.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    data-testid={`button-transport-day-${day.value}`}
                    onClick={() => handleDayToggle(day.value)}
                  >
                    {day.label.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">First Trip Date (optional)</Label>
              <Input
                id="startDate"
                type="date"
                data-testid="input-transport-start-date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-foreground">Accessibility & Special Needs</h4>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wheelchairAccessible">Wheelchair Accessible Vehicle Needed?</Label>
                <Select
                  value={formData.wheelchairAccessible}
                  onValueChange={(value) => handleInputChange("wheelchairAccessible", value)}
                >
                  <SelectTrigger data-testid="select-wheelchair">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, wheelchair accessible needed</SelectItem>
                    <SelectItem value="no">No, standard vehicle is fine</SelectItem>
                    <SelectItem value="not_sure">Not sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mobility Aids Used (select all that apply)</Label>
              <div className="grid gap-2 md:grid-cols-4">
                {MOBILITY_AIDS.map((aid) => (
                  <div key={aid.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mobility-${aid.value}`}
                      data-testid={`checkbox-mobility-${aid.value}`}
                      checked={formData.mobilityAids.includes(aid.value)}
                      onCheckedChange={() => handleMobilityToggle(aid.value)}
                    />
                    <Label htmlFor={`mobility-${aid.value}`} className="text-sm cursor-pointer">
                      {aid.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialAccommodations">Special Accommodations Needed</Label>
              <Textarea
                id="specialAccommodations"
                data-testid="textarea-special-accommodations"
                value={formData.specialAccommodations}
                onChange={(e) => handleInputChange("specialAccommodations", e.target.value)}
                placeholder="e.g., Extra time needed for transfers, door-to-door assistance required, oxygen transport..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b pb-2">Additional Information</h4>
            
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes or Questions</Label>
              <Textarea
                id="additionalNotes"
                data-testid="textarea-additional-notes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                placeholder="Any other information we should know..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="howHeardAboutUs">How did you hear about us?</Label>
              <Select
                value={formData.howHeardAboutUs}
                onValueChange={(value) => handleInputChange("howHeardAboutUs", value)}
              >
                <SelectTrigger data-testid="select-transport-referral">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreedToTerms"
                data-testid="checkbox-transport-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="agreedToTerms" className="text-sm cursor-pointer leading-relaxed">
                I agree to the{" "}
                <a href="/terms" className="text-primary underline" target="_blank">
                  Terms of Service
                </a>{" "}
                *
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreedToPolicy"
                data-testid="checkbox-transport-privacy"
                checked={agreedToPolicy}
                onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
              />
              <Label htmlFor="agreedToPolicy" className="text-sm cursor-pointer leading-relaxed">
                I agree to the{" "}
                <a href="/privacy" className="text-primary underline" target="_blank">
                  Privacy Policy
                </a>{" "}
                and consent to be contacted about services *
              </Label>
            </div>

            {siteKey && (
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={siteKey}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              data-testid="button-submit-transportation"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Transportation Request
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By submitting this form, you agree to receive communications from Private In-Home Caregiver. 
              Your information is protected and will never be shared.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
