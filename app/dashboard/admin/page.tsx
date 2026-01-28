"use client";

import React, { useEffect, useState } from "react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { getDashboardData } from "@/app/services/dashboard.service";
import { useRouter } from "next/navigation";

interface DashboardData {
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalSales: number;
  totalPurchases: number;
  totalRevenue: number;
  totalExpenses: number;
  lowStockItems: any[];
  recentSales: any[];
  recentPurchases: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Gagal memuat data dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewInventory = () => {
    router.push("/dashboard/admin/inventory");
  };

  const handleViewSales = () => {
    router.push("/dashboard/admin/transaksi/penjualan");
  };

  const handleViewPurchases = () => {
    router.push("/dashboard/admin/transaksi/pembelian");
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Dashboard Admin</h2>
          <p>Selamat datang, Admin Gudang 👋</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Admin</h2>
        <p className="text-muted-foreground">Selamat datang, Admin Gudang 👋</p>
      </div>

      <SummaryCards data={data} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlerts
          items={data?.lowStockItems || []}
          isLoading={isLoading}
          onViewInventory={handleViewInventory}
        />

        <RecentTransactions
          sales={data?.recentSales || []}
          purchases={data?.recentPurchases || []}
          isLoading={isLoading}
          onViewSales={handleViewSales}
          onViewPurchases={handleViewPurchases}
        />
      </div>
    </div>
  );
}
