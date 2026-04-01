import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Clock, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Service } from "../backend.d";
import BookingModal from "../components/BookingModal";
import { useActor } from "../hooks/useActor";

const serviceEmojis: Record<string, string> = {
  Plumbing: "🔧",
  Electrician: "⚡",
  Cleaning: "🧹",
  "AC Repair": "❄️",
  Painting: "🎨",
  Handyman: "🔨",
  Carpentry: "🪚",
  "Pest Control": "🐛",
};

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
];

const fallbackServices: Service[] = [
  {
    id: 1n,
    name: "Plumbing",
    description: "Fix leaks, install pipes, repair fixtures and more.",
    basePrice: 500n,
    estimatedDuration: 120n,
    icon: "🔧",
  },
  {
    id: 2n,
    name: "Electrician",
    description:
      "Wiring, circuit breakers, fan installation and electrical repairs.",
    basePrice: 600n,
    estimatedDuration: 90n,
    icon: "⚡",
  },
  {
    id: 3n,
    name: "Cleaning",
    description: "Deep home cleaning, sofa cleaning, carpet washing.",
    basePrice: 1200n,
    estimatedDuration: 180n,
    icon: "🧹",
  },
  {
    id: 4n,
    name: "AC Repair",
    description: "AC servicing, gas refill, cooling issues and installation.",
    basePrice: 1500n,
    estimatedDuration: 120n,
    icon: "❄️",
  },
  {
    id: 5n,
    name: "Painting",
    description: "Interior and exterior wall painting, waterproofing.",
    basePrice: 3000n,
    estimatedDuration: 480n,
    icon: "🎨",
  },
  {
    id: 6n,
    name: "Handyman",
    description: "General repairs, furniture assembly, wall mounting.",
    basePrice: 400n,
    estimatedDuration: 60n,
    icon: "🔨",
  },
  {
    id: 7n,
    name: "Carpentry",
    description: "Custom furniture, door/window repair, cabinet making.",
    basePrice: 800n,
    estimatedDuration: 150n,
    icon: "🪚",
  },
  {
    id: 8n,
    name: "Pest Control",
    description: "Termite treatment, cockroach control, rodent removal.",
    basePrice: 2000n,
    estimatedDuration: 120n,
    icon: "🐛",
  },
];

export default function ServicesPage() {
  const { actor, isFetching } = useActor();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >();

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return fallbackServices;
      const result = await actor.getAllServices();
      return result.length > 0 ? result : fallbackServices;
    },
    enabled: !!actor && !isFetching,
    placeholderData: fallbackServices,
  });

  const displayServices = services ?? fallbackServices;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-orange-cta font-semibold text-sm uppercase tracking-wide mb-2">
              All Services
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Our Services
            </h1>
            <p className="text-white/70 mt-3 max-w-xl mx-auto">
              Professional home services at your doorstep. All providers are
              verified and insured.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? SKELETON_KEYS.map((key) => (
                <div key={key} data-ocid="services.loading_state">
                  <Skeleton className="h-64 w-full rounded-xl" />
                </div>
              ))
            : displayServices.map((service, i) => (
                <motion.div
                  key={service.id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  data-ocid={`services.item.${i + 1}`}
                >
                  <Card className="h-full shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl mb-3">
                          {service.icon || serviceEmojis[service.name] || "🔧"}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          ~{service.estimatedDuration.toString()} min
                        </Badge>
                      </div>
                      <CardTitle className="font-display text-navy text-lg">
                        {service.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-orange-cta font-bold">
                          <DollarSign className="w-4 h-4" />
                          <span>PKR {service.basePrice.toString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Clock className="w-3 h-3" />
                          <span>
                            {service.estimatedDuration.toString()} min
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4 bg-navy hover:bg-navy/90 text-white group-hover:bg-orange-cta group-hover:hover:bg-orange-cta/90 transition-colors"
                        onClick={() => {
                          setSelectedServiceId(service.id.toString());
                          setBookingOpen(true);
                        }}
                        data-ocid={`services.primary_button.${i + 1}`}
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>
      </div>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preSelectedServiceId={selectedServiceId}
      />
    </div>
  );
}
