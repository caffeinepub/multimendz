import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Circle,
  Clock,
  Loader2,
  MapPin,
  Package,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BookingStatus } from "../backend.d";
import type { Booking } from "../backend.d";
import LiveMap from "../components/LiveMap";
import { useActor } from "../hooks/useActor";

const statusSteps = [
  { key: BookingStatus.pending, label: "Order Placed", icon: Package },
  { key: BookingStatus.confirmed, label: "Confirmed", icon: CheckCircle },
  { key: BookingStatus.inProgress, label: "In Progress", icon: Clock },
  { key: BookingStatus.completed, label: "Completed", icon: CheckCircle },
];

const statusOrder = [
  BookingStatus.pending,
  BookingStatus.confirmed,
  BookingStatus.inProgress,
  BookingStatus.completed,
];

export default function TrackOrderPage() {
  const { actor, isFetching } = useActor();
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [searchId, setSearchId] = useState<bigint | null>(null);

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery<Booking>({
    queryKey: ["booking", searchId?.toString()],
    queryFn: async () => {
      if (!actor || searchId === null) throw new Error();
      return actor.getBooking(searchId);
    },
    enabled: !!actor && !isFetching && searchId !== null,
    refetchInterval: 10000,
  });

  const handleSearch = () => {
    const id = Number.parseInt(bookingIdInput, 10);
    if (!Number.isNaN(id)) setSearchId(BigInt(id));
  };

  const currentStepIdx = booking ? statusOrder.indexOf(booking.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-navy py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Track Your Order
            </h1>
            <p className="text-white/70 mt-2">
              Enter your booking ID to get real-time updates.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="shadow-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="booking-id-input">Booking ID</Label>
                <Input
                  id="booking-id-input"
                  placeholder="Enter your booking ID (e.g. 12345)"
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="mt-1"
                  data-ocid="track.input"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="bg-orange-cta hover:bg-orange-cta/90 text-white w-full sm:w-auto"
                  onClick={handleSearch}
                  disabled={!bookingIdInput || isLoading}
                  data-ocid="track.primary_button"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Track Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isError && (
          <Card
            className="shadow-card mb-8 border-red-200"
            data-ocid="track.error_state"
          >
            <CardContent className="p-6 text-center">
              <p className="text-red-600 font-semibold">Booking not found.</p>
              <p className="text-muted-foreground text-sm mt-1">
                Please check your booking ID and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            data-ocid="track.card"
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-navy flex items-center justify-between">
                  <span>Booking #{booking.id.toString()}</span>
                  <Badge className="text-sm">{booking.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-navy" />
                    <span>{booking.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-navy" />
                    <span>
                      {booking.scheduledDate} at {booking.scheduledTime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-navy text-lg">
                  Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {statusSteps.map((step, i) => {
                    const isCompleted = i <= currentStepIdx;
                    const isCurrent = i === currentStepIdx;
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.key}
                        className="flex items-start gap-4 pb-6 last:pb-0 relative"
                      >
                        {i < statusSteps.length - 1 && (
                          <div
                            className={`absolute left-[19px] top-8 w-0.5 h-full ${i < currentStepIdx ? "bg-orange-cta" : "bg-border"}`}
                          />
                        )}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${isCompleted ? "bg-orange-cta border-orange-cta" : "bg-background border-border"}`}
                        >
                          {isCurrent ? (
                            <Clock
                              className="w-4 h-4 text-white animate-spin"
                              style={{ animationDuration: "3s" }}
                            />
                          ) : isCompleted ? (
                            <Icon className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p
                            className={`font-semibold ${isCompleted ? "text-navy" : "text-muted-foreground"}`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-orange-cta text-sm">
                              Currently in this stage
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {(booking.status === BookingStatus.inProgress ||
              booking.status === BookingStatus.confirmed) && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-navy flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-cta" />
                    Live Provider Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveMap
                    className="w-full h-72"
                    animated
                    bookingId={booking.id}
                  />
                  <p className="text-muted-foreground text-sm mt-3 text-center">
                    Your provider is on the way. Location updates every 2
                    seconds.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {!booking && !isError && searchId === null && (
          <Card className="shadow-card" data-ocid="track.empty_state">
            <CardContent className="py-16 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-lg text-navy">
                Enter a Booking ID to Track
              </p>
              <p className="text-muted-foreground">
                Your real-time tracking will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
