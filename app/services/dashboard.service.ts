import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Produk } from "../types/produk";
import { Pelanggan } from "../types/pelanggan";
import { Supplier } from "../types/suplyer";
import { Penjualan } from "../types/penjualan";
import { Pembelian } from "../types/pembelian";

export interface DashboardData {
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalSales: number;
  totalPurchases: number;
  totalRevenue: number;
  totalExpenses: number;
  lowStockItems: LowStockItem[];
  recentSales: RecentTransaction[];
  recentPurchases: RecentTransaction[];
}

export interface LowStockItem {
  id: string;
  nama: string;
  kode: string;
  currentStock: number;
  minStock: number;
}

export interface RecentTransaction {
  id: string;
  kode: string;
  tanggal: Date;
  total: number;
  status: string;
  pelanggan?: string;
  supplier?: string;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    // Get total counts
    const [products, customers, suppliers, sales, purchases] =
      await Promise.all([
        getTotalProducts(),
        getTotalCustomers(),
        getTotalSuppliers(),
        getTotalSales(),
        getTotalPurchases(),
      ]);

    // Get financial data
    const [revenue, expenses] = await Promise.all([
      getTotalRevenue(),
      getTotalExpenses(),
    ]);

    // Get low stock items
    const lowStockItems = await getLowStockItems();

    // Get recent transactions
    const [recentSales, recentPurchases] = await Promise.all([
      getRecentSales(),
      getRecentPurchases(),
    ]);

    return {
      totalProducts: products,
      totalCustomers: customers,
      totalSuppliers: suppliers,
      totalSales: sales,
      totalPurchases: purchases,
      totalRevenue: revenue,
      totalExpenses: expenses,
      lowStockItems,
      recentSales,
      recentPurchases,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

const getTotalProducts = async (): Promise<number> => {
  const q = query(collection(db, "produk"));
  const snap = await getDocs(q);
  return snap.size;
};

const getTotalCustomers = async (): Promise<number> => {
  const q = query(collection(db, "pelanggan"));
  const snap = await getDocs(q);
  return snap.size;
};

const getTotalSuppliers = async (): Promise<number> => {
  const q = query(collection(db, "suppliers"));
  const snap = await getDocs(q);
  return snap.size;
};

const getTotalSales = async (): Promise<number> => {
  const q = query(collection(db, "penjualan"));
  const snap = await getDocs(q);
  return snap.size;
};

const getTotalPurchases = async (): Promise<number> => {
  const q = query(collection(db, "pembelian"));
  const snap = await getDocs(q);
  return snap.size;
};

const getTotalRevenue = async (): Promise<number> => {
  const q = query(collection(db, "penjualan"));
  const snap = await getDocs(q);

  let total = 0;
  snap.forEach((doc) => {
    const data = doc.data() as Penjualan;
    total += data.total || 0;
  });

  return total;
};

const getTotalExpenses = async (): Promise<number> => {
  const q = query(collection(db, "pembelian"));
  const snap = await getDocs(q);

  let total = 0;
  snap.forEach((doc) => {
    const data = doc.data() as Pembelian;
    total += data.total || 0;
  });

  return total;
};

const getLowStockItems = async (): Promise<LowStockItem[]> => {
  // This is a simplified version. In a real implementation,
  // you'd need to calculate current stock from pembelian and penjualan
  const q = query(collection(db, "produk"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  const lowStockItems: LowStockItem[] = [];
  snap.forEach((doc) => {
    const data = doc.data() as Produk;
    // For demo purposes, assume min stock is 10 and current stock is random
    const minStock = 10;
    const currentStock = Math.floor(Math.random() * 20); // This should be calculated properly

    if (currentStock < minStock) {
      lowStockItems.push({
        id: doc.id,
        nama: data.nama,
        kode: data.kode,
        currentStock,
        minStock,
      });
    }
  });

  return lowStockItems.slice(0, 5); // Return top 5 low stock items
};

const getRecentSales = async (): Promise<RecentTransaction[]> => {
  const q = query(
    collection(db, "penjualan"),
    orderBy("createdAt", "desc"),
    limit(3),
  );
  const snap = await getDocs(q);

  const recentSales: RecentTransaction[] = [];
  for (const doc of snap.docs) {
    const data = doc.data() as Penjualan;
    let pelangganName = "Unknown";

    if (data.pelangganId) {
      try {
        const pelangganDoc = await getDocs(
          query(
            collection(db, "pelanggan"),
            where("id", "==", data.pelangganId),
          ),
        );
        if (!pelangganDoc.empty) {
          const pelangganData = pelangganDoc.docs[0].data() as Pelanggan;
          pelangganName = pelangganData.namaToko || pelangganData.namaPelanggan;
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    }

    recentSales.push({
      id: doc.id,
      kode: data.noInvoice || `SL-${doc.id.slice(-6)}`,
      tanggal: data.createdAt || new Date(),
      total: data.total || 0,
      status: data.status || "Belum Lunas",
      pelanggan: pelangganName,
    });
  }

  return recentSales;
};

const getRecentPurchases = async (): Promise<RecentTransaction[]> => {
  const q = query(
    collection(db, "pembelian"),
    orderBy("createdAt", "desc"),
    limit(3),
  );
  const snap = await getDocs(q);

  const recentPurchases: RecentTransaction[] = [];
  for (const doc of snap.docs) {
    const data = doc.data() as Pembelian;
    let supplierName = "Unknown";

    if (data.supplierId) {
      try {
        const supplierDoc = await getDocs(
          query(
            collection(db, "suppliers"),
            where("id", "==", data.supplierId),
          ),
        );
        if (!supplierDoc.empty) {
          const supplierData = supplierDoc.docs[0].data() as Supplier;
          supplierName = supplierData.nama;
        }
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    }

    recentPurchases.push({
      id: doc.id,
      kode: data.invoice || `PB-${doc.id.slice(-6)}`,
      tanggal: data.createdAt || new Date(),
      total: data.total || 0,
      status: data.status || "Belum Lunas",
      supplier: supplierName,
    });
  }

  return recentPurchases;
};
