import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    longitude: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Rating {
    bookingId: bigint;
    comment: string;
    rating: bigint;
    providerId: bigint;
}
export interface Service {
    id: bigint;
    icon: string;
    name: string;
    description: string;
    estimatedDuration: bigint;
    basePrice: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Booking {
    id: bigint;
    customerName: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    customer: Principal;
    scheduledDate: string;
    scheduledTime: string;
    address: string;
    serviceId: bigint;
    phone: string;
    providerId?: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Provider {
    id: bigint;
    serviceType: bigint;
    name: string;
    isAvailable: boolean;
    rating: number;
    totalReviews: bigint;
    location: Location;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed",
    inProgress = "inProgress"
}
export enum PaymentStatus {
    paid = "paid",
    unpaid = "unpaid",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProvider(name: string, serviceType: bigint): Promise<bigint>;
    addService(name: string, description: string, icon: string, basePrice: bigint, duration: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmPayment(bookingId: bigint, sessionId: string): Promise<void>;
    createBooking(serviceId: bigint, customerName: string, phone: string, address: string, date: string, time: string): Promise<bigint>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPaymentSession(bookingId: bigint, amount: bigint, currency: string): Promise<string>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllProviders(): Promise<Array<Provider>>;
    getAllServices(): Promise<Array<Service>>;
    getBooking(id: bigint): Promise<Booking>;
    getBookingPaymentStatus(id: bigint): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProvider(id: bigint): Promise<Provider>;
    getProviderLocation(bookingId: bigint): Promise<Location>;
    getProviderRatings(providerId: bigint): Promise<Array<Rating>>;
    getService(id: bigint): Promise<Service>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserBookings(): Promise<Array<Booking>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitRating(bookingId: bigint, providerId: bigint, rating: bigint, comment: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
    updateProviderLocation(providerId: bigint, latitude: number, longitude: number): Promise<void>;
}
