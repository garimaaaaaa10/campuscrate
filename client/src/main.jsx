import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/authContext'
import './index.css'
import Navbar from './components/navbar'
import Home from './pages/home'
import Login from './pages/login'
import ItemDetail from './pages/itemDetail'
import PostItem from './pages/postItem'
import Dashboard from './pages/dashboard'
import AdminDashboard from './pages/admin'

const GOOGLE_CLIENT_ID = '963491633088-srioud0rgm3n5lqh41mvkq8sfhl0l0cl.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/post" element={<PostItem />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)