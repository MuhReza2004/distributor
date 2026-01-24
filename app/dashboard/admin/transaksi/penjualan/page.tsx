"use client";

import { useEffect, useState } from "react";
import { Penjualan } from "@/app/types/penjualan";
import PenjualanForm from "@/components/penjualan/PenjualanForm";
import PenjualanTabel from "@/components/penjualan/PenjualanTabel";
import { DialogDetailPenjualan } from "@/components/penjualan/DialogDetailPenjualan";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function PenjualanPage() {
  const [data, setData] = useState<Penjualan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogDetailOpen, setDialogDetailOpen] = useState(false);
  const [selectedPenjualan, setSelectedPenjualan] = useState<Penjualan | null>(null);

  useEffect(() => {
    const q = query(collection(db, "penjualan"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sales = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Penjualan[];
        setData(sales);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching sales:", err);
        setError("Gagal memuat data penjualan.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleViewDetails = (penjualan: Penjualan) => {
    setSelectedPenjualan(penjualan);
    setDialogDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Transaksi Penjualan</h1>
      <PenjualanForm />
      <PenjualanTabel 
        data={data} 
        isLoading={isLoading} 
        error={error} 
        onViewDetails={handleViewDetails}
      />
      <DialogDetailPenjualan 
        open={dialogDetailOpen}
        onOpenChange={setDialogDetailOpen}
        penjualan={selectedPenjualan}
      />
    </div>
  );
}
