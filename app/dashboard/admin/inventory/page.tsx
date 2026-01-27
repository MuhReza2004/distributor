"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { InventoryTable } from "@/components/barang/InventoryTable";
import {
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Produk } from "@/app/types/produk";
import { Pembelian } from "@/app/types/pembelian";
import { Penjualan } from "@/app/types/penjualan";

export interface InventoryData extends Produk {
  totalMasuk: number;
  totalKeluar: number;
}

export default function InventoryPage() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [pembelian, setPembelian] = useState<Pembelian[]>([]);
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const qProduk = query(collection(db, "produk"));
    const unsubProduk = onSnapshot(
      qProduk,
      (snap) =>
        setProduk(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Produk),
        ),
      (err) => setError("Gagal memuat produk."),
    );

    const qPembelian = query(collection(db, "pembelian"));
    const unsubPembelian = onSnapshot(
      qPembelian,
      async (snap) => {
        const pembelianData = snap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Pembelian,
        );
        // Populate items for each pembelian
        for (const pembelian of pembelianData) {
          if (pembelian.id) {
            const detailQuery = query(
              collection(db, "pembelian_detail"),
              where("pembelianId", "==", pembelian.id),
            );
            const detailSnap = await getDocs(detailQuery);
            pembelian.items = detailSnap.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as any,
            );
          }
        }
        setPembelian(pembelianData);
      },
      (err) => setError("Gagal memuat pembelian."),
    );

    const qPenjualan = query(collection(db, "penjualan"));
    const unsubPenjualan = onSnapshot(
      qPenjualan,
      async (snap) => {
        const penjualanData = snap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Penjualan,
        );
        // Populate items for each penjualan
        for (const penjualan of penjualanData) {
          if (penjualan.id) {
            const detailQuery = query(
              collection(db, "penjualan_detail"),
              where("penjualanId", "==", penjualan.id),
            );
            const detailSnap = await getDocs(detailQuery);
            penjualan.items = detailSnap.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as any,
            );
          }
        }
        setPenjualan(penjualanData);
      },
      (err) => setError("Gagal memuat penjualan."),
    );

    return () => {
      unsubProduk();
      unsubPembelian();
      unsubPenjualan();
    };
  }, []);

  useEffect(() => {
    if (produk.length > 0) {
      setIsLoading(true);
      const inventory: InventoryData[] = produk.map((p) => {
        const totalMasuk = pembelian.reduce((sum, beli) => {
          return (
            sum +
            (beli.items || []).reduce(
              (itemSum, item) =>
                item.produkId === p.id ? itemSum + item.qty : itemSum,
              0,
            )
          );
        }, 0);

        const totalKeluar = penjualan.reduce((sum, jual) => {
          return (
            sum +
            jual.items.reduce(
              (itemSum, item) =>
                item.produkId === p.id ? itemSum + item.qty : itemSum,
              0,
            )
          );
        }, 0);

        return { ...p, totalMasuk, totalKeluar };
      });
      setInventoryData(inventory);
      setIsLoading(false);
    }
  }, [produk, pembelian, penjualan]);

  const filteredData = useMemo(
    () =>
      inventoryData.filter(
        (p) =>
          p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.kode.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [inventoryData, searchTerm],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan Inventory</h1>
        <p className="mt-2 text-gray-600">
          Laporan stok masuk, stok keluar, dan stok akhir setiap produk.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari kode atau nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <InventoryTable inventoryData={filteredData} isLoading={isLoading} />
    </div>
  );
}
