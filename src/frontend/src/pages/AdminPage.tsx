import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  Plus,
  Settings,
  Shield,
  ShieldAlert,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus, PaymentStatus } from "../backend.d";
import type { Booking, Provider, Service } from "../backend.d";
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

const ALL_STATUSES = [
  BookingStatus.pending,
  BookingStatus.confirmed,
  BookingStatus.inProgress,
  BookingStatus.completed,
  BookingStatus.cancelled,
];

export default function AdminPage() {
  const { actor, isFetching } = useActor();
  const { identity, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Admin check
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery<boolean>({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["all-bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
    refetchInterval: 15000,
  });

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });

  const { data: providers, isLoading: providersLoading } = useQuery<Provider[]>(
    {
      queryKey: ["all-providers"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getAllProviders();
      },
      enabled: !!actor && !isFetching && isAdmin === true,
    },
  );

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: () => {
      toast.success("Booking status updated!");
      queryClient.invalidateQueries({ queryKey: ["all-bookings"] });
    },
    onError: () => toast.error("Failed to update status."),
  });

  // Add Service dialog
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    icon: "🔧",
    basePrice: "",
    duration: "",
  });

  const addServiceMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.addService(
        serviceForm.name,
        serviceForm.description,
        serviceForm.icon,
        BigInt(Math.round(Number.parseFloat(serviceForm.basePrice) * 100)),
        BigInt(Number.parseInt(serviceForm.duration)),
      );
    },
    onSuccess: () => {
      toast.success("Service added successfully!");
      setAddServiceOpen(false);
      setServiceForm({
        name: "",
        description: "",
        icon: "🔧",
        basePrice: "",
        duration: "",
      });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: () => toast.error("Failed to add service."),
  });

  // Add Provider dialog
  const [addProviderOpen, setAddProviderOpen] = useState(false);
  const [providerForm, setProviderForm] = useState({
    name: "",
    serviceType: "",
  });

  const addProviderMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.addProvider(
        providerForm.name,
        BigInt(providerForm.serviceType),
      );
    },
    onSuccess: () => {
      toast.success("Provider added successfully!");
      setAddProviderOpen(false);
      setProviderForm({ name: "", serviceType: "" });
      queryClient.invalidateQueries({ queryKey: ["all-providers"] });
    },
    onError: () => toast.error("Failed to add provider."),
  });

  const getServiceName = (id: bigint) =>
    services?.find((s) => s.id === id)?.name ?? `Service #${id}`;

  // Not logged in
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
            Please login to access the admin panel.
          </p>
          <Button
            className="bg-navy hover:bg-navy/90 text-white px-8"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="admin.primary_button"
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

  // Loading admin check
  if (isAdminLoading || isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-navy"
          data-ocid="admin.loading_state"
        />
      </div>
    );
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm" data-ocid="admin.error_state">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display font-bold text-2xl text-navy mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges to access this panel.
          </p>
          <Button
            variant="outline"
            className="border-navy text-navy hover:bg-navy hover:text-white"
            onClick={() => login()}
            data-ocid="admin.primary_button"
          >
            Login as Different Account
          </Button>
        </div>
      </div>
    );
  }

  // Stats
  const totalBookings = bookings?.length ?? 0;
  const pendingCount =
    bookings?.filter((b) => b.status === BookingStatus.pending).length ?? 0;
  const activeCount =
    bookings?.filter(
      (b) =>
        b.status === BookingStatus.inProgress ||
        b.status === BookingStatus.confirmed,
    ).length ?? 0;
  const completedCount =
    bookings?.filter((b) => b.status === BookingStatus.completed).length ?? 0;
  const servicesCount = services?.length ?? 0;
  const providersCount = providers?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navy py-10">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-cta rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-white">
              Admin Panel
            </h1>
            <p className="text-white/70 text-sm">
              Manage all bookings, services, and providers
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" data-ocid="admin.tab">
          <TabsList className="mb-8 bg-white shadow-card border">
            <TabsTrigger
              value="overview"
              className="gap-2"
              data-ocid="admin.tab"
            >
              <TrendingUp className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="gap-2"
              data-ocid="admin.tab"
            >
              <BookOpen className="w-4 h-4" /> Bookings
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="gap-2"
              data-ocid="admin.tab"
            >
              <Settings className="w-4 h-4" /> Services
            </TabsTrigger>
            <TabsTrigger
              value="providers"
              className="gap-2"
              data-ocid="admin.tab"
            >
              <Users className="w-4 h-4" /> Providers
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                {
                  label: "Total Bookings",
                  value: totalBookings,
                  color: "text-navy",
                  icon: <BookOpen className="w-5 h-5" />,
                },
                {
                  label: "Pending",
                  value: pendingCount,
                  color: "text-yellow-600",
                  icon: <Clock className="w-5 h-5" />,
                },
                {
                  label: "Active",
                  value: activeCount,
                  color: "text-orange-cta",
                  icon: <TrendingUp className="w-5 h-5" />,
                },
                {
                  label: "Completed",
                  value: completedCount,
                  color: "text-green-600",
                  icon: <CheckCircle2 className="w-5 h-5" />,
                },
                {
                  label: "Services",
                  value: servicesCount,
                  color: "text-purple-600",
                  icon: <Briefcase className="w-5 h-5" />,
                },
                {
                  label: "Providers",
                  value: providersCount,
                  color: "text-blue-600",
                  icon: <Users className="w-5 h-5" />,
                },
              ].map(({ label, value, color, icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  data-ocid={`admin.card.${i + 1}`}
                >
                  <Card className="shadow-card">
                    <CardContent className="p-4 text-center">
                      <div className={`flex justify-center mb-2 ${color}`}>
                        {icon}
                      </div>
                      <p className={`font-display font-bold text-3xl ${color}`}>
                        {value}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-navy text-lg">
                    Booking Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ALL_STATUSES.map((status) => {
                    const count =
                      bookings?.filter((b) => b.status === status).length ?? 0;
                    const pct =
                      totalBookings > 0
                        ? Math.round((count / totalBookings) * 100)
                        : 0;
                    const sc = statusConfig[status];
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <Badge
                          className={`text-xs border-0 w-24 justify-center ${sc.color}`}
                        >
                          {sc.label}
                        </Badge>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-navy transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display text-navy text-lg">
                    Top Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(services ?? []).slice(0, 5).map((svc, i) => (
                    <div
                      key={svc.id.toString()}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xl">{svc.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-navy">
                          {svc.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bookings?.filter((b) => b.serviceId === svc.id)
                            .length ?? 0}{" "}
                          bookings
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{i + 1}
                      </Badge>
                    </div>
                  ))}
                  {(services ?? []).length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No services yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── BOOKINGS ── */}
          <TabsContent value="bookings">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-navy">
                  All Bookings
                </CardTitle>
                <Badge variant="outline">{totalBookings} total</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {bookingsLoading ? (
                  <div
                    className="p-6 space-y-3"
                    data-ocid="admin.loading_state"
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (bookings ?? []).length === 0 ? (
                  <div
                    className="p-12 text-center"
                    data-ocid="admin.empty_state"
                  >
                    <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No bookings found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table data-ocid="admin.table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(bookings ?? []).map((booking, i) => {
                          const sc = statusConfig[booking.status];
                          return (
                            <TableRow
                              key={booking.id.toString()}
                              data-ocid={`admin.item.${i + 1}`}
                            >
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                #{booking.id.toString()}
                              </TableCell>
                              <TableCell className="font-medium">
                                {booking.customerName}
                              </TableCell>
                              <TableCell>
                                {getServiceName(booking.serviceId)}
                              </TableCell>
                              <TableCell className="text-sm">
                                <span className="block">
                                  {booking.scheduledDate}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {booking.scheduledTime}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm max-w-[160px] truncate">
                                {booking.address}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-xs border-0 ${sc?.color}`}
                                >
                                  {sc?.label ?? booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {booking.paymentStatus ===
                                  PaymentStatus.paid && (
                                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                    ✅ Paid
                                  </Badge>
                                )}
                                {booking.paymentStatus ===
                                  PaymentStatus.unpaid && (
                                  <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                                    ⏳ Unpaid
                                  </Badge>
                                )}
                                {booking.paymentStatus ===
                                  PaymentStatus.failed && (
                                  <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                    ❌ Failed
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={booking.status}
                                  onValueChange={(val) =>
                                    updateStatusMutation.mutate({
                                      bookingId: booking.id,
                                      status: val as BookingStatus,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    className="w-36 h-8 text-xs"
                                    data-ocid={`admin.select.${i + 1}`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ALL_STATUSES.map((s) => (
                                      <SelectItem
                                        key={s}
                                        value={s}
                                        className="text-xs"
                                      >
                                        {statusConfig[s].label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SERVICES ── */}
          <TabsContent value="services">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-xl text-navy">
                  Services
                </h2>
                <p className="text-muted-foreground text-sm">
                  {servicesCount} services configured
                </p>
              </div>
              <Dialog open={addServiceOpen} onOpenChange={setAddServiceOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-orange-cta hover:bg-orange-cta/90 text-white"
                    data-ocid="admin.open_modal_button"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="admin.dialog">
                  <DialogHeader>
                    <DialogTitle className="font-display text-navy">
                      Add New Service
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the service details to add it to the platform.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <Label>Icon (emoji)</Label>
                        <Input
                          value={serviceForm.icon}
                          onChange={(e) =>
                            setServiceForm((p) => ({
                              ...p,
                              icon: e.target.value,
                            }))
                          }
                          placeholder="🔧"
                          className="text-xl text-center"
                          data-ocid="admin.input"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Service Name</Label>
                        <Input
                          value={serviceForm.name}
                          onChange={(e) =>
                            setServiceForm((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g. Plumbing Repair"
                          data-ocid="admin.input"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={serviceForm.description}
                        onChange={(e) =>
                          setServiceForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Brief description of the service..."
                        rows={3}
                        data-ocid="admin.textarea"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Base Price (PKR)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={serviceForm.basePrice}
                          onChange={(e) =>
                            setServiceForm((p) => ({
                              ...p,
                              basePrice: e.target.value,
                            }))
                          }
                          placeholder="500"
                          data-ocid="admin.input"
                        />
                      </div>
                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={serviceForm.duration}
                          onChange={(e) =>
                            setServiceForm((p) => ({
                              ...p,
                              duration: e.target.value,
                            }))
                          }
                          placeholder="60"
                          data-ocid="admin.input"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAddServiceOpen(false)}
                      data-ocid="admin.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-orange-cta hover:bg-orange-cta/90 text-white"
                      onClick={() => addServiceMutation.mutate()}
                      disabled={
                        addServiceMutation.isPending ||
                        !serviceForm.name ||
                        !serviceForm.basePrice ||
                        !serviceForm.duration
                      }
                      data-ocid="admin.submit_button"
                    >
                      {addServiceMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Add Service
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {servicesLoading ? (
              <div
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                data-ocid="admin.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : (services ?? []).length === 0 ? (
              <Card className="shadow-card" data-ocid="admin.empty_state">
                <CardContent className="py-16 text-center">
                  <Settings className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No services yet. Add your first service!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(services ?? []).map((svc, i) => (
                  <motion.div
                    key={svc.id.toString()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <Card className="shadow-card h-full hover:shadow-card-hover transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {svc.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-navy truncate">
                              {svc.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {svc.description}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <Badge variant="outline" className="text-xs">
                                PKR{" "}
                                {(Number(svc.basePrice) / 100).toLocaleString()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {svc.estimatedDuration.toString()} min
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── PROVIDERS ── */}
          <TabsContent value="providers">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-xl text-navy">
                  Providers
                </h2>
                <p className="text-muted-foreground text-sm">
                  {providersCount} registered providers
                </p>
              </div>
              <Dialog open={addProviderOpen} onOpenChange={setAddProviderOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-orange-cta hover:bg-orange-cta/90 text-white"
                    data-ocid="admin.open_modal_button"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Provider
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="admin.dialog">
                  <DialogHeader>
                    <DialogTitle className="font-display text-navy">
                      Add New Provider
                    </DialogTitle>
                    <DialogDescription>
                      Register a new service provider on the platform.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Provider Name</Label>
                      <Input
                        value={providerForm.name}
                        onChange={(e) =>
                          setProviderForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g. Ahmed Khan"
                        data-ocid="admin.input"
                      />
                    </div>
                    <div>
                      <Label>Service Type</Label>
                      <Select
                        value={providerForm.serviceType}
                        onValueChange={(val) =>
                          setProviderForm((p) => ({ ...p, serviceType: val }))
                        }
                      >
                        <SelectTrigger data-ocid="admin.select">
                          <SelectValue placeholder="Select a service..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(services ?? []).map((svc) => (
                            <SelectItem
                              key={svc.id.toString()}
                              value={svc.id.toString()}
                            >
                              {svc.icon} {svc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAddProviderOpen(false)}
                      data-ocid="admin.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-orange-cta hover:bg-orange-cta/90 text-white"
                      onClick={() => addProviderMutation.mutate()}
                      disabled={
                        addProviderMutation.isPending ||
                        !providerForm.name ||
                        !providerForm.serviceType
                      }
                      data-ocid="admin.submit_button"
                    >
                      {addProviderMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Add Provider
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {providersLoading ? (
              <div
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                data-ocid="admin.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-36" />
                ))}
              </div>
            ) : (providers ?? []).length === 0 ? (
              <Card className="shadow-card" data-ocid="admin.empty_state">
                <CardContent className="py-16 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No providers yet. Add your first provider!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(providers ?? []).map((provider, i) => (
                  <motion.div
                    key={provider.id.toString()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <Card className="shadow-card h-full hover:shadow-card-hover transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {provider.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-navy">
                                {provider.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {getServiceName(provider.serviceType)}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              provider.isAvailable
                                ? "bg-green-100 text-green-700 border-0"
                                : "bg-red-100 text-red-700 border-0"
                            }
                          >
                            {provider.isAvailable ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />{" "}
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" /> Busy
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-orange-cta text-orange-cta" />
                            <span className="font-semibold text-sm">
                              {provider.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {provider.totalReviews.toString()} reviews
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
