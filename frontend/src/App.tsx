import React, { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import PointDeVente from "@/pages/PointDeVente";
import Produits from "@/pages/Produits";
import Ventes from "@/pages/Ventes";
import Clients from "@/pages/Clients";
import Rapports from "@/pages/Rapports";
import Caisse from "@/pages/Caisse";
import AlertesStock from "@/pages/AlertesStock";
import Profile from "@/pages/Profile";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    document.documentElement.setAttribute("lang", "fr");
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="point-de-vente" element={<PointDeVente />} />
          <Route path="ventes" element={<Ventes />} />
          <Route path="produits" element={<Produits />} />
          <Route path="clients" element={<Clients />} />
          <Route path="rapports" element={<Rapports />} />
          <Route path="caisse" element={<Caisse />} />
          <Route path="alertes-stock" element={<AlertesStock />} />
        <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
