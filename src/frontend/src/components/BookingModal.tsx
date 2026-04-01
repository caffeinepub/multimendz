import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Service } from "../backend.d";
import { useActor } from "../hooks/useActor";

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  preSelectedServiceId?: string;
}

export default function BookingModal({
  open,
  onClose,
  preSelectedServiceId,
}: BookingModalProps) {
  const { actor, isFetching } = useActor();
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentPending, setPaymentPending] = useState(false);
  const [payLaterClicked, setPayLaterClicked] = useState(false);
  const [payNowLoading, setPayNowLoading] = useState(false);

  const [form, setForm] = useState({
    serviceId: preSelectedServiceId ?? "",
    name: "",
    phone: "",
    address: "",
    date: "",
    time: "",
  });

  // Check URL params for payment result when modal opens
  useEffect(() => {
    if (open) {
      const params = new URLSearchParams(window.location.search);
      const payment = params.get("payment");
      if (payment === "success" || payment === "cancel") {
        setStep(4);
        setPaymentPending(payment === "cancel");
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [open]);

  const { data: services } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const id = await actor.createBooking(
        BigInt(form.serviceId),
        form.name,
        form.phone,
        form.address,
        form.date,
        form.time,
      );
      return id.toString();
    },
    onSuccess: (id) => {
      setBookingId(id);
      setStep(3);
    },
    onError: () => {
      toast.error("Booking failed. Please try again.");
    },
  });

  const handlePayNow = async () => {
    if (!actor || !bookingId) return;
    setPayNowLoading(true);
    try {
      const selectedService = services?.find(
        (s) => s.id.toString() === form.serviceId,
      );
      const price = selectedService?.basePrice ?? 0n;
      const checkoutUrl = await actor.createPaymentSession(
        BigInt(bookingId),
        BigInt(price),
        "usd",
      );
      window.location.href = checkoutUrl;
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
      setPayNowLoading(false);
    }
  };

  const handlePayLater = () => {
    setPayLaterClicked(true);
    setPaymentPending(true);
    setStep(4);
  };

  const handleClose = () => {
    setStep(1);
    setBookingId(null);
    setPaymentPending(false);
    setPayLaterClicked(false);
    setPayNowLoading(false);
    setForm({
      serviceId: preSelectedServiceId ?? "",
      name: "",
      phone: "",
      address: "",
      date: "",
      time: "",
    });
    onClose();
  };

  const selectedService = services?.find(
    (s) => s.id.toString() === form.serviceId,
  );

  // Determine payment badge for step 4
  const getPaymentBadge = () => {
    if (payLaterClicked || paymentPending) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-0 text-sm px-3 py-1">
          ⏳ Payment Pending
        </Badge>
      );
    }
    // Check URL param result
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      return (
        <Badge className="bg-green-100 text-green-700 border-0 text-sm px-3 py-1">
          ✅ Paid
        </Badge>
      );
    }
    if (payment === "cancel") {
      return (
        <Badge className="bg-red-100 text-red-700 border-0 text-sm px-3 py-1">
          ❌ Payment Failed
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-100 text-orange-700 border-0 text-sm px-3 py-1">
        ⏳ Payment Pending
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" data-ocid="booking.modal">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-navy">
            {step === 1 && "Book a Service"}
            {step === 2 && "Choose Date & Time"}
            {step === 3 && "Payment"}
            {step === 4 && "Booking Confirmed!"}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators (steps 1-3 only) */}
        {step <= 3 && (
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step >= s
                      ? "bg-navy text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-0.5 w-8 ${step > s ? "bg-navy" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-select">Select Service</Label>
              <Select
                value={form.serviceId}
                onValueChange={(v) => setForm((f) => ({ ...f, serviceId: v }))}
              >
                <SelectTrigger id="service-select" data-ocid="booking.select">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services?.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>
                      {s.icon} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cust-name">
                <User className="inline w-3 h-3 mr-1" />
                Full Name
              </Label>
              <Input
                id="cust-name"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="booking.input"
              />
            </div>
            <div>
              <Label htmlFor="cust-phone">
                <Phone className="inline w-3 h-3 mr-1" />
                Phone Number
              </Label>
              <Input
                id="cust-phone"
                placeholder="+92 300 1234567"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                data-ocid="booking.input"
              />
            </div>
            <div>
              <Label htmlFor="cust-address">
                <MapPin className="inline w-3 h-3 mr-1" />
                Address
              </Label>
              <Input
                id="cust-address"
                placeholder="House/Street/Area"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                data-ocid="booking.input"
              />
            </div>
            <Button
              className="w-full bg-orange-cta hover:bg-orange-cta/90 text-white"
              onClick={() => setStep(2)}
              disabled={
                !form.serviceId || !form.name || !form.phone || !form.address
              }
              data-ocid="booking.primary_button"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="booking-date">
                <Calendar className="inline w-3 h-3 mr-1" />
                Preferred Date
              </Label>
              <Input
                id="booking-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                data-ocid="booking.input"
              />
            </div>
            <div>
              <Label>
                <Clock className="inline w-3 h-3 mr-1" />
                Preferred Time
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, time: t }))}
                    className={`py-2 px-1 rounded-lg text-xs font-medium border transition-colors ${
                      form.time === t
                        ? "bg-navy text-white border-navy"
                        : "bg-white border-border hover:border-navy"
                    }`}
                    data-ocid="booking.toggle"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {selectedService && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-semibold text-navy">
                  {selectedService.icon} {selectedService.name}
                </p>
                <p className="text-muted-foreground mt-1">
                  {selectedService.description}
                </p>
                <p className="text-orange-cta font-bold mt-1">
                  PKR {selectedService.basePrice.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
                data-ocid="booking.cancel_button"
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-navy hover:bg-navy/90 text-white"
                onClick={() => mutation.mutate()}
                disabled={!form.date || !form.time || mutation.isPending}
                data-ocid="booking.submit_button"
              >
                {mutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Confirm & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 - Payment */}
        {step === 3 && (
          <div className="space-y-5" data-ocid="booking.panel">
            {/* Order Summary */}
            <div className="bg-muted rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Order Summary
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground">
                  {selectedService?.icon} {selectedService?.name}
                </span>
                <span className="font-bold text-navy">
                  PKR {selectedService?.basePrice.toString()}
                </span>
              </div>
              {form.date && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {form.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {form.time}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold text-navy">Total</span>
                <span className="font-bold text-lg text-orange-cta">
                  PKR {selectedService?.basePrice.toString()}
                </span>
              </div>
            </div>

            {/* Booking ID confirmation */}
            {bookingId && (
              <div className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-green-700">Booking created</span>
                <Badge variant="secondary" className="font-mono">
                  #{bookingId}
                </Badge>
              </div>
            )}

            {/* Pay Now */}
            <Button
              className="w-full bg-navy hover:bg-navy/90 text-white gap-2"
              onClick={handlePayNow}
              disabled={payNowLoading}
              data-ocid="booking.primary_button"
            >
              {payNowLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {payNowLoading
                ? "Redirecting to payment..."
                : "Pay Now with Stripe"}
            </Button>

            {/* Pay Later */}
            <Button
              variant="outline"
              className="w-full border-muted-foreground/30 text-muted-foreground hover:border-navy hover:text-navy"
              onClick={handlePayLater}
              disabled={payNowLoading}
              data-ocid="booking.secondary_button"
            >
              Pay Later (Cash on Service)
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        )}

        {/* Step 4 - Confirmed */}
        {step === 4 && (
          <div
            className="text-center py-4 space-y-4"
            data-ocid="booking.success_state"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-navy">
                Booking Confirmed!
              </p>
              <p className="text-muted-foreground mt-1">
                Your booking has been placed successfully.
              </p>
            </div>

            {/* Payment Status Badge */}
            <div className="flex justify-center">{getPaymentBadge()}</div>

            <div className="bg-muted rounded-lg p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID</span>
                <Badge variant="secondary" className="font-mono">
                  #{bookingId}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{form.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{form.time}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-ocid="booking.close_button"
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-navy hover:bg-navy/90 text-white"
                onClick={() => {
                  handleClose();
                  window.location.href = "/track";
                }}
                data-ocid="booking.primary_button"
              >
                Track Order
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
