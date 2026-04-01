import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  LogIn,
  MapPin,
  Phone,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus, PaymentStatus } from "../backend.d";
import type { Booking, Service } from "../backend.d";
import LiveMap from "../components/LiveMap";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const statusConfig: Record<string, { label: string; color: string }> = {
  [BookingStatus.pending]: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
  },
  [BookingStatus.confirmed]: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700",
  },
  [BookingStatus.inProgress]: {
    label: "In Progress",
    color: "bg-orange-100 text-orange-700",
  },
  [BookingStatus.completed]: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
  },
  [BookingStatus.cancelled]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
  },
};

const STAR_RATINGS = [1, 2, 3, 4, 5];

export default function DashboardPage() {
  const { actor, isFetching } = useActor();
  const { identity, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [ratingOpen, setRatingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [trackingBookingId, setTrackingBookingId] = useState<bigint | null>(
    null,
  );
  const [payNowLoadingId, setPayNowLoadingId] = useState<string | null>(null);

  const handleDashboardPayNow = async (
    bookingId: bigint,
    serviceId: bigint,
  ) => {
    const service = services?.find((s) => s.id === serviceId);
    const price = service?.basePrice ?? 0n;
    setPayNowLoadingId(bookingId.toString());
    try {
      if (!actor) throw new Error();
      const checkoutUrl = await actor.createPaymentSession(
        bookingId,
        price,
        "usd",
      );
      window.location.href = checkoutUrl;
    } catch {
      toast.error("Failed to initiate payment.");
      setPayNowLoadingId(null);
    }
  };

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["user-bookings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserBookings();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 10000,
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });

  const ratingMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !selectedBooking) throw new Error();
      await actor.submitRating(
        selectedBooking.id,
        selectedBooking.providerId ?? 1n,
        BigInt(stars),
        comment,
      );
    },
    onSuccess: () => {
      toast.success("Rating submitted!");
      setRatingOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
    onError: () => toast.error("Failed to submit rating."),
  });

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-navy" />
          </div>
          <h2 className="font-display font-bold text-2xl text-navy mb-2">
            Login Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please login to view your bookings and manage your account.
          </p>
          <Button
            className="bg-navy hover:bg-navy/90 text-white px-8"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="dashboard.primary_button"
          >
            {loginStatus === "logging-in" && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Login with Internet Identity
          </Button>
        </div>
      </div>
    );
  }

  const activeBookings =
    bookings?.filter(
      (b) =>
        b.status === BookingStatus.inProgress ||
        b.status === BookingStatus.confirmed,
    ) ?? [];
  const pastBookings =
    bookings?.filter(
      (b) =>
        b.status === BookingStatus.completed ||
        b.status === BookingStatus.cancelled,
    ) ?? [];
  const pendingBookings =
    bookings?.filter((b) => b.status === BookingStatus.pending) ?? [];

  const getServiceName = (id: bigint) =>
    services?.find((s) => s.id === id)?.name ?? `Service #${id}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-display font-bold text-3xl text-white">
            My Dashboard
          </h1>
          <p className="text-white/70 mt-1">
            Welcome back, {identity.getPrincipal().toString().slice(0, 12)}...
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total Bookings",
              value: bookings?.length ?? 0,
              color: "text-navy",
            },
            {
              label: "Active",
              value: activeBookings.length,
              color: "text-orange-cta",
            },
            {
              label: "Completed",
              value: pastBookings.filter(
                (b) => b.status === BookingStatus.completed,
              ).length,
              color: "text-green-600",
            },
            {
              label: "Pending",
              value: pendingBookings.length,
              color: "text-yellow-600",
            },
          ].map(({ label, value, color }) => (
            <Card key={label} className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className={`font-display font-bold text-3xl ${color}`}>
                  {value}
                </p>
                <p className="text-muted-foreground text-sm mt-1">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Tracking */}
        {activeBookings.length > 0 && (
          <Card className="shadow-card mb-8 border-orange-cta/30">
            <CardHeader>
              <CardTitle className="font-display text-navy flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-cta" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your provider is on the way!
                  </p>
                  {activeBookings.map((b) => (
                    <button
                      type="button"
                      key={b.id.toString()}
                      onClick={() => setTrackingBookingId(b.id)}
                      className={`w-full text-left p-3 rounded-lg mb-2 border transition-colors ${
                        trackingBookingId === b.id
                          ? "border-orange-cta bg-orange-50"
                          : "border-border hover:border-orange-cta/50"
                      }`}
                      data-ocid="track.toggle"
                    >
                      <p className="font-semibold text-navy text-sm">
                        {getServiceName(b.serviceId)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {b.scheduledDate} at {b.scheduledTime}
                      </p>
                      <Badge
                        className={`mt-1 text-xs ${statusConfig[b.status]?.color}`}
                      >
                        {statusConfig[b.status]?.label}
                      </Badge>
                    </button>
                  ))}
                </div>
                <LiveMap className="h-64 rounded-xl" animated />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings Tabs */}
        <Tabs defaultValue="all" data-ocid="dashboard.tab">
          <TabsList className="mb-6">
            <TabsTrigger value="all" data-ocid="dashboard.tab">
              All
            </TabsTrigger>
            <TabsTrigger value="pending" data-ocid="dashboard.tab">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="active" data-ocid="dashboard.tab">
              Active ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-ocid="dashboard.tab">
              History
            </TabsTrigger>
          </TabsList>

          {["all", "pending", "active", "past"].map((tab) => {
            const tabBookings =
              tab === "all"
                ? (bookings ?? [])
                : tab === "pending"
                  ? pendingBookings
                  : tab === "active"
                    ? activeBookings
                    : pastBookings;

            return (
              <TabsContent key={tab} value={tab}>
                {isLoading ? (
                  <div
                    className="space-y-4"
                    data-ocid="dashboard.loading_state"
                  >
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                  </div>
                ) : tabBookings.length === 0 ? (
                  <Card
                    className="shadow-card"
                    data-ocid="dashboard.empty_state"
                  >
                    <CardContent className="py-16 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-semibold text-lg text-navy">
                        No bookings found
                      </p>
                      <p className="text-muted-foreground">
                        Your {tab} bookings will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {tabBookings.map((booking, i) => {
                      const sc = statusConfig[booking.status];
                      return (
                        <motion.div
                          key={booking.id.toString()}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          data-ocid={`dashboard.item.${i + 1}`}
                        >
                          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-display font-bold text-navy">
                                      {getServiceName(booking.serviceId)}
                                    </h3>
                                    <Badge
                                      className={`text-xs border-0 ${sc?.color}`}
                                    >
                                      {sc?.label ?? booking.status}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {booking.customerName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {booking.phone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {booking.scheduledDate}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {booking.scheduledTime}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {booking.address}
                                  </p>
                                  {/* Payment Status Badge */}
                                  <div className="mt-2">
                                    {booking.paymentStatus ===
                                      PaymentStatus.paid && (
                                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                        ✅ Paid
                                      </Badge>
                                    )}
                                    {booking.paymentStatus ===
                                      PaymentStatus.failed && (
                                      <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                        ❌ Payment Failed
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {booking.paymentStatus ===
                                    PaymentStatus.unpaid && (
                                    <Button
                                      size="sm"
                                      className="bg-orange-cta hover:bg-orange-cta/90 text-white gap-1"
                                      onClick={() =>
                                        handleDashboardPayNow(
                                          booking.id,
                                          booking.serviceId,
                                        )
                                      }
                                      disabled={
                                        payNowLoadingId ===
                                        booking.id.toString()
                                      }
                                      data-ocid={`dashboard.primary_button.${i + 1}`}
                                    >
                                      {payNowLoadingId ===
                                      booking.id.toString() ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <CreditCard className="w-3 h-3" />
                                      )}
                                      Pay Now
                                    </Button>
                                  )}
                                  {booking.status ===
                                    BookingStatus.completed && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-navy text-navy hover:bg-navy hover:text-white"
                                      onClick={() => {
                                        setSelectedBooking(booking);
                                        setRatingOpen(true);
                                      }}
                                      data-ocid={`dashboard.edit_button.${i + 1}`}
                                    >
                                      <Star className="w-3 h-3 mr-1" /> Rate
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Rating Dialog */}
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent data-ocid="rating.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-navy">
              Rate Your Service
            </DialogTitle>
            <DialogDescription>
              Share your experience to help others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {STAR_RATINGS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStars(s)}
                    className="transition-transform hover:scale-110"
                    data-ocid="rating.toggle"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        s <= stars
                          ? "fill-orange-cta text-orange-cta"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="rating-comment">Comment</Label>
              <Textarea
                id="rating-comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                data-ocid="rating.textarea"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setRatingOpen(false)}
                data-ocid="rating.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-cta hover:bg-orange-cta/90 text-white"
                onClick={() => ratingMutation.mutate()}
                disabled={ratingMutation.isPending}
                data-ocid="rating.submit_button"
              >
                {ratingMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Submit Rating
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
