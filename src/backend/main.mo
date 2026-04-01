import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";


actor {
  // Include authorization system (admin, user, guest)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type definitions
  type Location = {
    latitude : Float;
    longitude : Float;
  };

  type Service = {
    id : Nat;
    name : Text;
    description : Text;
    icon : Text;
    basePrice : Nat;
    estimatedDuration : Nat;
  };

  type Provider = {
    id : Nat;
    name : Text;
    serviceType : Nat; // refer to Service id
    rating : Float;
    totalReviews : Nat;
    isAvailable : Bool;
    location : Location;
  };

  type BookingStatus = {
    #pending;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
  };

  type PaymentStatus = {
    #unpaid;
    #paid;
    #failed;
  };

  type Booking = {
    id : Nat;
    serviceId : Nat;
    customer : Principal;
    customerName : Text;
    phone : Text;
    address : Text;
    scheduledDate : Text;
    scheduledTime : Text;
    status : BookingStatus;
    providerId : ?Nat;
    paymentStatus : PaymentStatus;
  };

  type Rating = {
    bookingId : Nat;
    providerId : Nat;
    rating : Nat;
    comment : Text;
  };

  type UserProfile = {
    name : Text;
    phone : Text;
    email : Text;
  };

  // Internal state (persistent state)
  var nextServiceId = 1000;
  var nextProviderId = 2000;
  var nextBookingId = 3000;

  let services = Map.empty<Nat, Service>();
  let providers = Map.empty<Nat, Provider>();
  let bookings = Map.empty<Nat, Booking>();
  let ratings = Map.empty<Nat, Rating>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sessionOwners = Map.empty<Text, Principal>();

  // Modules for comparison
  module Service {
    public func compare(a : Service, b : Service) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Provider {
    public func compare(a : Provider, b : Provider) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Booking {
    public func compare(a : Booking, b : Booking) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Rating {
    public func compare(a : Rating, b : Rating) : Order.Order {
      Nat.compare(a.bookingId, b.bookingId);
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Services catalog
  public shared ({ caller }) func addService(name : Text, description : Text, icon : Text, basePrice : Nat, duration : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };
    let id = nextServiceId;
    nextServiceId += 1;
    let service : Service = {
      id;
      name;
      description;
      icon;
      basePrice;
      estimatedDuration = duration;
    };
    services.add(id, service);
    id;
  };

  public query ({ caller }) func getService(id : Nat) : async Service {
    switch (services.get(id)) {
      case (null) {
        Runtime.trap("Service not found");
      };
      case (?service) { service };
    };
  };

  public query ({ caller }) func getAllServices() : async [Service] {
    services.values().toArray().sort();
  };

  // Service providers
  public shared ({ caller }) func addProvider(name : Text, serviceType : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add providers");
    };
    let id = nextProviderId;
    nextProviderId += 1;
    let provider : Provider = {
      id;
      name;
      serviceType;
      rating = 0;
      totalReviews = 0;
      isAvailable = true;
      location = { latitude = 0; longitude = 0 };
    };
    providers.add(id, provider);
    id;
  };

  public query ({ caller }) func getProvider(id : Nat) : async Provider {
    switch (providers.get(id)) {
      case (null) {
        Runtime.trap("Provider not found");
      };
      case (?provider) { provider };
    };
  };

  public query ({ caller }) func getAllProviders() : async [Provider] {
    providers.values().toArray().sort();
  };

  // Booking
  public shared ({ caller }) func createBooking(serviceId : Nat, customerName : Text, phone : Text, address : Text, date : Text, time : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };
    let id = nextBookingId;
    nextBookingId += 1;
    let booking : Booking = {
      id;
      serviceId;
      customer = caller;
      customerName;
      phone;
      address;
      scheduledDate = date;
      scheduledTime = time;
      status = #pending;
      providerId = null;
      paymentStatus = #unpaid;
    };
    bookings.add(id, booking);
    id;
  };

  public query ({ caller }) func getBooking(id : Nat) : async Booking {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    switch (bookings.get(id)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        if (caller != booking.customer and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own bookings");
        };
        booking;
      };
    };
  };

  public query ({ caller }) func getUserBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their bookings");
    };
    bookings.values().toArray().filter(func(b) { b.customer == caller });
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray().sort();
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update booking status");
    };
    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        // Only the customer, admin, or assigned provider can update status
        let isAuthorized = caller == booking.customer or AccessControl.isAdmin(accessControlState, caller);
        if (not isAuthorized) {
          Runtime.trap("Unauthorized: Can only update your own bookings");
        };
        let updatedBooking = { booking with status };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  // Live tracking
  public shared ({ caller }) func updateProviderLocation(providerId : Nat, latitude : Float, longitude : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update provider location");
    };
    // In a real system, we would verify that the caller is the provider or an admin
    // For now, we allow any authenticated user (providers would be users with special permissions)
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      // Additional provider verification could be added here
      // For simplicity, we allow users to update (assuming they are providers)
    };
    switch (providers.get(providerId)) {
      case (null) {
        Runtime.trap("Provider not found");
      };
      case (?provider) {
        let updatedProvider = {
          provider with
          location = { latitude; longitude };
        };
        providers.add(providerId, updatedProvider);
      };
    };
  };

  public query ({ caller }) func getProviderLocation(bookingId : Nat) : async Location {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view provider location");
    };
    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        // Only the customer or admin can track the provider
        if (caller != booking.customer and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only track your own bookings");
        };
        switch (booking.providerId) {
          case (null) {
            Runtime.trap("No provider assigned");
          };
          case (?providerId) {
            switch (providers.get(providerId)) {
              case (null) {
                Runtime.trap("Provider not found");
              };
              case (?provider) { provider.location };
            };
          };
        };
      };
    };
  };

  // Ratings
  public shared ({ caller }) func submitRating(bookingId : Nat, providerId : Nat, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit ratings");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    // Verify the booking exists and belongs to the caller
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (caller != booking.customer) {
          Runtime.trap("Unauthorized: Can only rate your own bookings");
        };
        // Verify the booking is completed
        switch (booking.status) {
          case (#completed) {};
          case (_) { Runtime.trap("Can only rate completed bookings") };
        };
        // Verify the provider matches
        switch (booking.providerId) {
          case (null) { Runtime.trap("No provider assigned to this booking") };
          case (?id) {
            if (id != providerId) {
              Runtime.trap("Provider ID does not match booking");
            };
          };
        };
      };
    };
    let ratingEntry : Rating = {
      bookingId;
      providerId;
      rating;
      comment;
    };
    ratings.add(bookingId, ratingEntry);
  };

  public query ({ caller }) func getProviderRatings(providerId : Nat) : async [Rating] {
    ratings.values().toArray().filter(func(r) { r.providerId == providerId });
  };

  // Stripe integration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) {
        Runtime.trap("Payment needs to be first configured");
      };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    // Verify the caller owns this session or is an admin
    switch (sessionOwners.get(sessionId)) {
      case (null) {
        Runtime.trap("Session not found");
      };
      case (?owner) {
        if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only check your own payment sessions");
        };
      };
    };
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout session");
    };
    let sessionId = await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
    sessionOwners.add(sessionId, caller);
    sessionId;
  };

  // Create payment session for booking
  public shared ({ caller }) func createPaymentSession(bookingId : Nat, amount : Nat, currency : Text) : async Text {
    // Authenticate user (anonym cannot book)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payment sessions");
    };

    // Verify booking
    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        // Verify ownership or admin
        let isOwner = caller == booking.customer or AccessControl.isAdmin(accessControlState, caller);
        if (not isOwner) {
          Runtime.trap("Unauthorized: Can only pay for your own bookings");
        };
        //Booking found, proceed

        // Convert amount to cents straight
        let priceInCents = amount;

        let items : [Stripe.ShoppingItem] = [{
          currency;
          productName = "Booking Payment";
          productDescription = "Payment for booking #" # bookingId.toText();
          priceInCents;
          quantity = 1;
        }];

        // TODO: Pass success/cancel URLs from frontend
        let successUrl = "https://takeanumber.app/success";
        let cancelUrl = "https://takeanumber.app/cancel";

        // Create Stripe checkout session (this will return the Stripe session ID)
        let sessionId = await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);

        // Store session ownership for authorization
        sessionOwners.add(sessionId, caller);

        // Return session ID to frontend (redirect user to Stripe payment page)
        sessionId;
      };
    };
  };

  // Confirm payment for booking
  public shared ({ caller }) func confirmPayment(bookingId : Nat, sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can confirm payments");
    };

    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        // Verify ownership or admin
        if (caller != booking.customer and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only confirm payment for your own bookings");
        };

        // Verify session ownership
        switch (sessionOwners.get(sessionId)) {
          case (null) {
            Runtime.trap("Session not found");
          };
          case (?owner) {
            if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only confirm your own payment sessions");
            };
          };
        };

        // Check payment status with Stripe via HTTP outcall
        let paymentStatus = await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);

        switch (paymentStatus) {
          case (#completed _) {
            let updatedBooking = { booking with paymentStatus = #paid };
            bookings.add(bookingId, updatedBooking);
          };
          case (#failed { error }) {
            let updatedBooking = { booking with paymentStatus = #failed };
            bookings.add(bookingId, updatedBooking);
          };
        };
      };
    };
  };

  // Get payment status for booking
  public query ({ caller }) func getBookingPaymentStatus(id : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment status");
    };

    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        // Verify ownership or admin
        if (caller != booking.customer and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view payment status for your own bookings");
        };

        switch (booking.paymentStatus) {
          case (#unpaid) { "unpaid" };
          case (#paid) { "paid" };
          case (#failed) { "failed" };
        };
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
