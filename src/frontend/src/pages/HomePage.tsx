import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  ThumbsUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import BookingModal from "../components/BookingModal";
import LiveMap from "../components/LiveMap";

const services = [
  {
    emoji: "🔧",
    label: "Plumbing",
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    emoji: "⚡",
    label: "Electrician",
    color: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
  {
    emoji: "🧹",
    label: "Cleaning",
    color: "bg-green-50 text-green-700 border-green-100",
  },
  {
    emoji: "❄️",
    label: "AC Repair",
    color: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    emoji: "🎨",
    label: "Painting",
    color: "bg-purple-50 text-purple-700 border-purple-100",
  },
  {
    emoji: "🔨",
    label: "Handyman",
    color: "bg-orange-50 text-orange-700 border-orange-100",
  },
  {
    emoji: "🪚",
    label: "Carpentry",
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    emoji: "🐛",
    label: "Pest Control",
    color: "bg-red-50 text-red-700 border-red-100",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    desc: "All our service providers are background-checked and certified.",
  },
  {
    icon: Zap,
    title: "Quick Booking",
    desc: "Book your service in under 2 minutes, anytime and anywhere.",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    desc: "Track your service provider in real-time on an interactive map.",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction Guaranteed",
    desc: "Not happy? We'll fix it or give you a full refund.",
  },
];

const FIVE_STARS = [1, 2, 3, 4, 5];

const testimonials = [
  {
    name: "Ayesha K.",
    initials: "AK",
    stars: 5,
    text: "Booked a plumber within minutes. He arrived right on time and fixed everything perfectly. Highly recommend Multimendz!",
    service: "Plumbing",
    color: "bg-blue-500",
  },
  {
    name: "Hamza R.",
    initials: "HR",
    stars: 5,
    text: "The AC repair technician was super professional and knowledgeable. Live tracking made the experience stress-free!",
    service: "AC Repair",
    color: "bg-green-600",
  },
  {
    name: "Sara M.",
    initials: "SM",
    stars: 5,
    text: "Amazing cleaning service! My house looks brand new. The team was punctual, thorough, and very friendly.",
    service: "Cleaning",
    color: "bg-purple-600",
  },
];

const stats = [
  { icon: Users, value: "50,000+", label: "Happy Customers" },
  { icon: Award, value: "2,000+", label: "Verified Pros" },
  { icon: CheckCircle, value: "98%", label: "Satisfaction Rate" },
  { icon: Clock, value: "30 min", label: "Avg. Response" },
];

const trackingFeatures = [
  "Live GPS tracking of your provider",
  "Real-time ETA and status updates",
  "Instant notifications on booking progress",
  "Direct contact with your assigned professional",
];

export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchService, setSearchService] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "oklch(18% 0.04 251)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url(/assets/generated/hero-home-services.dim_1400x700.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge className="mb-5 bg-orange-cta/20 text-orange-cta border-orange-cta/30 hover:bg-orange-cta/20">
              🏠 Trusted by 50,000+ Indians
            </Badge>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-5">
              Get Home Services{" "}
              <span className="text-gradient-blue">in Minutes</span>
            </h1>
            <p className="text-white/75 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Plumbing, electrical, cleaning, AC repair and more — booked
              instantly with verified professionals and real-time tracking.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-5 md:p-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={searchService} onValueChange={setSearchService}>
                <SelectTrigger className="h-12" data-ocid="hero.select">
                  <SelectValue placeholder="🔧 Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.label} value={s.label}>
                      {s.emoji} {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-12"
                  placeholder="Your location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  data-ocid="hero.input"
                />
              </div>
              <Button
                className="h-12 bg-orange-cta hover:bg-orange-cta/90 text-white font-semibold shadow-cta"
                onClick={() => setBookingOpen(true)}
                data-ocid="hero.primary_button"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Professionals
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-orange-cta" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg leading-none">
                    {value}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-orange-cta font-semibold text-sm uppercase tracking-wide mb-2">
              What We Offer
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy">
              Popular Services
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              From everyday repairs to deep cleaning — find the right
              professional for every job.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {services.map(({ emoji, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                data-ocid={`services.item.${i + 1}`}
              >
                <Link to="/services">
                  <Card className="cursor-pointer hover:shadow-card-hover transition-all hover:-translate-y-1 border-border">
                    <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                      <div
                        className={`w-12 h-12 rounded-xl ${color} border flex items-center justify-center text-2xl mb-3`}
                      >
                        {emoji}
                      </div>
                      <span className="font-semibold text-xs text-foreground">
                        {label}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services">
              <Button
                variant="outline"
                className="border-navy text-navy hover:bg-navy hover:text-white"
                data-ocid="services.secondary_button"
              >
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-orange-cta font-semibold text-sm uppercase tracking-wide mb-2">
                Why Us?
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy mb-10">
                Why Choose Multimendz?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map(({ icon: Icon, title, desc }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-navy mb-1">
                        {title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-blue-accent/20 to-orange-cta/10 rounded-2xl blur-xl" />
                <LiveMap className="relative w-full h-72 lg:h-96" animated />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Tracking Promo */}
      <section className="py-20 bg-navy">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="animate-float">
                <div className="w-52 h-96 bg-gray-900 rounded-[2.5rem] border-4 border-gray-700 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
                  <div className="w-full h-full pt-6">
                    <div className="bg-[oklch(18%_0.04_251)] h-full p-2">
                      <div className="text-white text-xs font-semibold px-2 py-2">
                        📍 Live Tracking
                      </div>
                      <LiveMap className="w-full h-52 rounded-lg" animated />
                      <div className="mt-2 bg-white/10 rounded-lg p-2">
                        <p className="text-white text-[10px] font-semibold">
                          Ahmad (Plumber)
                        </p>
                        <p className="text-white/60 text-[9px]">
                          Arriving in ~15 min
                        </p>
                        <div className="mt-1 h-1 bg-white/20 rounded-full">
                          <div className="h-1 w-2/3 bg-orange-cta rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <p className="text-orange-cta font-semibold text-sm uppercase tracking-wide mb-3">
                Real-Time Updates
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl mb-5 leading-tight">
                Track Your Service{" "}
                <span className="text-gradient-blue">in Real-Time</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Know exactly where your service provider is. Get live location
                updates, ETA, and real-time status notifications — all in one
                place.
              </p>
              <ul className="space-y-3 mb-8">
                {trackingFeatures.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <CheckCircle className="w-4 h-4 text-orange-cta shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-orange-cta hover:bg-orange-cta/90 text-white shadow-cta font-semibold px-8"
                  onClick={() => setBookingOpen(true)}
                  data-ocid="tracking.primary_button"
                >
                  Book Now
                </Button>
                <Link to="/track">
                  <Button
                    variant="outline"
                    className="border-white/30 text-white bg-transparent hover:bg-white/10"
                    data-ocid="tracking.secondary_button"
                  >
                    Track Order
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-orange-cta font-semibold text-sm uppercase tracking-wide mb-2">
              Reviews
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-navy">
              What Our Customers Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, initials, text, service, color }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`testimonials.item.${i + 1}`}
              >
                <Card className="h-full shadow-card hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {FIVE_STARS.map((starNum) => (
                        <Star
                          key={starNum}
                          className="w-4 h-4 fill-orange-cta text-orange-cta"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      "{text}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-navy to-[oklch(25%_0.09_251)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Book your first service today and experience the Multimendz
              difference.
            </p>
            <Button
              size="lg"
              className="bg-orange-cta hover:bg-orange-cta/90 text-white shadow-cta font-bold text-base px-10"
              onClick={() => setBookingOpen(true)}
              data-ocid="cta.primary_button"
            >
              Book a Service Now
            </Button>
          </motion.div>
        </div>
      </section>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
