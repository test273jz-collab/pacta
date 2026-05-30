import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pacta-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-pacta-navy border-t-pacta-gold rounded-full animate-spin" />
          <p className="text-sm font-medium text-pacta-navy/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-pacta-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
