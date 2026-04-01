import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import BookingModal from "../components/BookingModal";

export default function BookingPage() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      navigate({ to: "/" });
    }
  }, [open, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <BookingModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
