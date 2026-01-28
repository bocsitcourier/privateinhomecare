import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Star, MapPin, DollarSign, Calendar, Award } from "lucide-react";
import Header from "@/components/Header";
import type { Caregiver } from "@shared/schema";

export default function CaregiversPage() {
  const [locationFilter, setLocationFilter] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");

  const queryParams = new URLSearchParams();
  if (locationFilter) queryParams.append("location", locationFilter);
  if (minRate) queryParams.append("minRate", minRate);
  if (maxRate) queryParams.append("maxRate", maxRate);

  const { data: caregivers, isLoading } = useQuery({ 
    queryKey: ["/api/caregivers", locationFilter, minRate, maxRate],
    queryFn: () => fetch(`/api/caregivers?${queryParams.toString()}`).then(res => res.json())
  });

  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        pageSlug="caregivers"
        fallbackTitle="Find Caregivers in Massachusetts | PrivateInHomeCareGiver"
        fallbackDescription="Browse our network of experienced, certified caregivers across Massachusetts. Find the perfect match for your family's needs."
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Caregiver</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse our network of experienced, certified caregivers across Massachusetts. 
            Find the perfect match for your family's needs.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City or zip code"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  data-testid="input-location-filter"
                />
              </div>
              <div>
                <Label htmlFor="minRate">Min Rate ($/hr)</Label>
                <Input
                  id="minRate"
                  type="number"
                  placeholder="20"
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value)}
                  data-testid="input-min-rate"
                />
              </div>
              <div>
                <Label htmlFor="maxRate">Max Rate ($/hr)</Label>
                <Input
                  id="maxRate"
                  type="number"
                  placeholder="50"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  data-testid="input-max-rate"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline"
                onClick={() => {
                  setLocationFilter("");
                  setMinRate("");
                  setMaxRate("");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading caregivers...</p>
          </div>
        ) : Array.isArray(caregivers) && caregivers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No caregivers found matching your criteria. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(caregivers) && caregivers.map((caregiver: Caregiver) => (
              <Link href={`/caregivers/${caregiver.id}`} key={caregiver.id} data-testid={`link-caregiver-${caregiver.id}`}>
                <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-caregiver-${caregiver.id}`}>
                  <CardHeader>
                    <div className="flex gap-4">
                      {caregiver.photoUrl ? (
                        <img 
                          src={caregiver.photoUrl} 
                          alt={caregiver.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-3xl text-muted-foreground">{caregiver.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-1">{caregiver.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          {caregiver.location}
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <DollarSign className="w-4 h-4" />
                          ${caregiver.hourlyRate}/hr
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground/80 line-clamp-3">
                      {caregiver.bio}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-chart-1" />
                        <span className="font-medium">{caregiver.yearsExperience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-chart-2" />
                        <span>{caregiver.availability}</span>
                      </div>
                    </div>

                    {caregiver.certifications && caregiver.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {caregiver.certifications.slice(0, 3).map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {caregiver.certifications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{caregiver.certifications.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button className="w-full" data-testid={`button-view-profile-${caregiver.id}`}>
                      View Full Profile
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 bg-card rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Finding the Right Caregiver?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our care coordinators are here to help match you with the perfect caregiver for your family's unique needs.
          </p>
          <Link href="/consultation">
            <Button size="lg" data-testid="button-contact-coordinator">
              Contact a Care Coordinator
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
