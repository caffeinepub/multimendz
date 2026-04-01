import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Calendar,
  Clock,
  Loader2,
  Lock,
  MapPin,
  User,
} from "lucide-react";
import type { Booking } from "../backend.d";
import { BookingStatus, PaymentStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function statusBadge(status: BookingStatus) {
  const map: Record<BookingStatus, { label: string; className: string }> = {
    [BookingStatus.pending]: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800",
    },
    [BookingStatus.confirmed]: {
      label: "Confirmed",
      className: "bg-blue-100 text-blue-800",
    },
    [BookingStatus.inProgress]: {
      label: "In Progress",
      className: "bg-orange-100 text-orange-800",
    },
    [BookingStatus.completed]: {
      label: "Completed",
      className: "bg-green-100 text-green-800",
    },
    [BookingStatus.cancelled]: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800",
    },
  };
  const info = map[status] ?? {
    label: String(status),
    className: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge className={`${info.className} border-0 text-xs font-semibold`}>
      {info.label}
    </Badge>
  );
}

function paymentBadge(paymentStatus: PaymentStatus) {
  const map: Record<PaymentStatus, { label: string; className: string }> = {
    [PaymentStatus.paid]: {
      label: "Paid",
      className: "bg-green-100 text-green-800",
    },
    [PaymentStatus.unpaid]: {
      label: "Unpaid",
      className: "bg-orange-100 text-orange-800",
    },
    [PaymentStatus.failed]: {
      label: "Failed",
      className: "bg-red-100 text-red-800",
    },
  };
  const info = map[paymentStatus] ?? {
    label: String(paymentStatus),
    className: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge className={`${info.className} border-0 text-xs font-semibold`}>
      {info.label}
    </Badge>
  );
}

export default function ProviderPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["provider-bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const assignedBookings = (bookings ?? []).filter(
    (b) => b.providerId !== undefined && b.providerId !== null,
  );

  if (!identity) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="flex flex-col items-center py-12 space-y-6 text-center">
            <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-navy" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-navy">
                Provider Login
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Log in to view your assigned service requests
              </p>
            </div>
            <Button
              className="bg-navy hover:bg-navy/90 text-white gap-2 w-full"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="provider.primary_button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Login with Internet Identity
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-navy">
          Provider Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your assigned service bookings
        </p>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="provider.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : assignedBookings.length === 0 ? (
        <Card className="border-dashed" data-ocid="provider.empty_state">
          <CardContent className="flex flex-col items-center py-16 text-center space-y-3">
            <Briefcase className="w-12 h-12 text-muted-foreground/40" />
            <p className="font-semibold text-navy">No Assigned Bookings</p>
            <p className="text-sm text-muted-foreground">
              You have no service requests assigned to you yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignedBookings.map((booking, idx) => (
            <Card
              key={booking.id.toString()}
              className="shadow-sm hover:shadow-md transition-shadow"
              data-ocid={`provider.item.${idx + 1}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base font-semibold text-navy">
                    Booking #{booking.id.toString()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {statusBadge(booking.status)}
                    {paymentBadge(booking.paymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4 shrink-0" />
                    <span>{booking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>Service ID: {booking.serviceId.toString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{booking.scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{booking.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{booking.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
