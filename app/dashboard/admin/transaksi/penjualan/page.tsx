"use client";

import { useEffect, useState } from "react";
import { Penjualan } from "@/app/types/penjualan";
import PenjualanForm from "@/components/penjualan/PenjualanForm";
import PenjualanTabel from "@/components/penjualan/PenjualanTabel";
import { DialogDetailPenjualan } from "@/components/penjualan/DialogDetailPenjualan";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  updatePenjualanStatus,
  deletePenjualan,
} from "@/app/services/penjualan.service";
import { Plus } from "lucide-react";

export default function PenjualanPage() {
  const [data, setData] = useState<Penjualan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dialogDetailOpen, setDialogDetailOpen] = useState(false);
  const [selectedPenjualan, setSelectedPenjualan] = useState<Penjualan | null>(
    null,
  );
  const [editingPenjualan, setEditingPenjualan] = useState<Penjualan | null>(
    null,
  );

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
      },
    );

    return () => unsubscribe();
  }, []);

  const handleViewDetails = (penjualan: Penjualan) => {
    setSelectedPenjualan(penjualan);
    setDialogDetailOpen(true);
  };

  const handleUpdateStatus = async (
    id: string,
    status: "Lunas" | "Belum Lunas",
  ) => {
    try {
      await updatePenjualanStatus(id, status);
      alert(`Status penjualan berhasil diubah menjadi ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengubah status penjualan.");
    }
  };

  const handleEdit = (penjualan: Penjualan) => {
    setEditingPenjualan(penjualan);
    setIsFormOpen(true);
  };

  const handleCancel = async (id: string) => {
    if (
      confirm(
        "Apakah Anda yakin ingin membatalkan transaksi ini? Stok produk akan dikembalikan.",
      )
    ) {
      try {
        await deletePenjualan(id);
        alert("Transaksi berhasil dibatalkan dan stok telah dikembalikan.");
      } catch (error) {
        console.error("Error canceling transaction:", error);
        alert("Gagal membatalkan transaksi.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Transaksi Penjualan
        </h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Buat Penjualan
        </Button>
      </div>

      <PenjualanForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingPenjualan(null);
          }
        }}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingPenjualan(null);
        }}
        editingPenjualan={editingPenjualan}
      />

      <PenjualanTabel
        data={data}
        isLoading={isLoading}
        error={error}
        onViewDetails={handleViewDetails}
        onUpdateStatus={handleUpdateStatus}
        onEdit={handleEdit}
        onCancel={handleCancel}
      />
      <DialogDetailPenjualan
        open={dialogDetailOpen}
        onOpenChange={setDialogDetailOpen}
        penjualan={selectedPenjualan}
      />
    </div>
  );
}
