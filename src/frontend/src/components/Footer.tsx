import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Wrench, Youtube } from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About Us", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Press", href: "/" },
    { label: "Blog", href: "/" },
  ],
  Services: [
    { label: "Plumbing", href: "/services" },
    { label: "Electrician", href: "/services" },
    { label: "Cleaning", href: "/services" },
    { label: "AC Repair", href: "/services" },
  ],
  Resources: [
    { label: "Help Center", href: "/" },
    { label: "Partner With Us", href: "/" },
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
  ],
  Support: [
    { label: "Contact Us", href: "/" },
    { label: "Track Order", href: "/track" },
    { label: "Refund Policy", href: "/" },
    { label: "Community", href: "/" },
  ],
};

const socialLinks = [
  { Icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { Icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { Icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { Icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 font-display font-bold text-xl mb-3"
            >
              <div className="w-8 h-8 bg-orange-cta rounded-lg flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span>
                Multi<span className="text-orange-cta">mendz</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Your trusted platform for all home services. Quality
              professionals, just a tap away.
            </p>
            <div className="flex gap-3 mt-4">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-orange-cta transition-colors flex items-center justify-center"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-white/90 mb-4">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/55 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Multimendz. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              className="underline hover:text-white/70"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
