import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { CheckCircle, MapPin, Search, Star } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Choose a Service",
    desc: "Browse our wide range of home services. Select the one you need and fill in your details.",
    color: "bg-blue-50 text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    number: "02",
    icon: CheckCircle,
    title: "Get Confirmed",
    desc: "We match you with a verified professional nearby. You'll get an instant confirmation.",
    color: "bg-green-50 text-green-600",
    borderColor: "border-green-200",
  },
  {
    number: "03",
    icon: MapPin,
    title: "Track in Real-Time",
    desc: "Watch your professional en route on a live map. Get ETA updates and notifications.",
    color: "bg-orange-50 text-orange-600",
    borderColor: "border-orange-200",
  },
  {
    number: "04",
    icon: Star,
    title: "Rate & Review",
    desc: "After the service is done, share your feedback to help others make great choices.",
    color: "bg-purple-50 text-purple-600",
    borderColor: "border-purple-200",
  },
];

const faqs = [
  {
    q: "How do I book a service?",
    a: "Simply select a service, provide your details and address, choose a time slot, and confirm. It takes under 2 minutes!",
  },
  {
    q: "Are all professionals verified?",
    a: "Yes! Every professional on Multimendz goes through a rigorous background check and skills verification process.",
  },
  {
    q: "Can I track my provider?",
    a: "Absolutely. Once your booking is confirmed and the provider is en route, you'll see their live location on a map.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We have a 100% satisfaction guarantee. Contact our support and we'll resolve the issue or provide a full refund.",
  },
  {
    q: "How do I pay?",
    a: "You can pay in cash to the professional upon service completion, or via our secure online payment options.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-orange-cta font-semibold text-sm uppercase tracking-wide mb-2">
              Simple Process
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
              How It Works
            </h1>
            <p className="text-white/70 mt-3 max-w-xl mx-auto">
              Getting your home service done is as easy as 1-2-3-4.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(
            ({ number, icon: Icon, title, desc, color, borderColor }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`how.item.${i + 1}`}
              >
                <Card
                  className={`h-full shadow-card border ${borderColor} hover:shadow-card-hover transition-shadow`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-display font-extrabold text-3xl text-muted/50">
                        {number}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-navy mb-2">
                      {title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ),
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-muted py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-navy">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                data-ocid={`faq.item.${i + 1}`}
              >
                <Card className="shadow-card">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-navy mb-2">{q}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {a}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-navy text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Ready to Book?
          </h2>
          <p className="text-white/70 mb-8">
            Experience hassle-free home services with live tracking today.
          </p>
          <Link to="/booking">
            <Button
              size="lg"
              className="bg-orange-cta hover:bg-orange-cta/90 text-white shadow-cta font-bold px-10"
              data-ocid="how.primary_button"
            >
              Book a Service Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
