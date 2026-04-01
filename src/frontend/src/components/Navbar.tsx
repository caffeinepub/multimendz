import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, Shield, Wrench, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Track Order", href: "/track" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!identity;

  const { data: isAdmin } = useQuery<boolean>({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  return (
    <header className="sticky top-0 z-50 bg-navy shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-display font-bold text-xl"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 bg-orange-cta rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span>
            Multi<span className="text-orange-cta">mendz</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              activeProps={{ className: "text-orange-cta font-semibold" }}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
              activeProps={{ className: "text-orange-cta font-semibold" }}
              data-ocid="nav.link"
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-white/70 text-sm">Welcome back</span>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                onClick={() => clear()}
                data-ocid="nav.button"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              data-ocid="nav.button"
            >
              Login
            </Button>
          )}
          <Link to="/booking">
            <Button
              className="bg-orange-cta hover:bg-orange-cta/90 text-white shadow-cta font-semibold"
              size="sm"
              data-ocid="nav.primary_button"
            >
              Book Now
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-navy border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-white/80 hover:text-white py-2 text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-white/80 hover:text-white py-2 text-sm font-medium flex items-center gap-1"
                  onClick={() => setMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                {isLoggedIn ? (
                  <Button
                    variant="outline"
                    className="border-white/30 text-white bg-transparent"
                    onClick={() => {
                      clear();
                      setMenuOpen(false);
                    }}
                    data-ocid="nav.button"
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-white/30 text-white bg-transparent"
                    onClick={() => {
                      login();
                      setMenuOpen(false);
                    }}
                    data-ocid="nav.button"
                  >
                    Login
                  </Button>
                )}
                <Link to="/booking" onClick={() => setMenuOpen(false)}>
                  <Button
                    className="w-full bg-orange-cta hover:bg-orange-cta/90 text-white"
                    data-ocid="nav.primary_button"
                  >
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
