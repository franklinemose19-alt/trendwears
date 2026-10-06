import { Routes, Route } from 'react-router-dom'
import StoreLayout from '@/layouts/StoreLayout'
import AdminLayout from '@/layouts/AdminLayout'
import MiraAdminLayout from '@/layouts/MiraAdminLayout'
import MiraLanding from '@/pages/MiraLanding'
import Home from '@/pages/Home'
import Shop from '@/pages/Shop'
import Saved from '@/pages/Saved'
import Cart from '@/pages/Cart'
import ProductDetails from '@/pages/ProductDetails'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminAnalytics from '@/pages/admin/AdminAnalytics'
import AdminSettings from '@/pages/admin/AdminSettings'
import BusinessList from '@/pages/mira-admin/BusinessList'
import ProtectedRoute from '@/components/ProtectedRoute'
import MiraProtectedRoute from '@/components/MiraProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MiraLanding />} />

      <Route path="/store/:slug" element={<StoreLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="saved" element={<Saved />} />
        <Route path="cart" element={<Cart />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route
        path="/mira-admin"
        element={
          <MiraProtectedRoute>
            <MiraAdminLayout />
          </MiraProtectedRoute>
        }
      >
        <Route index element={<BusinessList />} />
      </Route>
    </Routes>
  )
}
