import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Explore from "@/pages/Explore";
import ListingDetail from "@/pages/ListingDetail";
import Providers from "@/pages/Providers";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import MyReservations from "@/pages/MyReservations";
import Book from "@/pages/Book";
import Wishlist from "@/pages/Wishlist";
import Notifications from "@/pages/Notifications";
import Contact from "@/pages/Contact";
import ProviderDashboard from "@/pages/ProviderDashboard";
import AdminUsers from "@/pages/Admin/Users";
import AdminMessages from "@/pages/Admin/Messages";
import AdminAnalytics from "@/pages/Admin/Analytics";
import AdminReviews from "@/pages/Admin/Reviews";
import MusicPlayer from "@/components/musicPlayer"; // 1. Import your new player
import ScrollToTop from "./components/ScrollToTop";
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <ScrollToTop /> {/* Add this here */}
          <MusicPlayer />
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/providers/:type" element={<Providers />} />
              <Route path="/contact" element={<Contact />} />

              {/* Tourist Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reservations" element={<MyReservations />} />
                <Route path="/book/:id" element={<Book />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              {/* Provider Routes */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "hotel_owner",
                      "resort_owner",
                      "rental_owner",
                      "guide",
                    ]}
                  />
                }
              >
                <Route
                  path="/provider/dashboard"
                  element={<ProviderDashboard />}
                />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
              </Route>
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
