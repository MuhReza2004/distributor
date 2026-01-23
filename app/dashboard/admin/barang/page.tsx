"use client"

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import TabelProduk, { TabelProdukRef } from "@/components/produk/TabelProduk";
import DialogTambahProduk from "@/components/produk/DialogTambahProduk";
import DialogEditProduk from "@/components/produk/DialogEditProduk";
import DialogHapusProduk from "@/components/produk/DialogHapusProduk";
import { Produk } from "@/app/types/produk";
import { Plus } from "lucide-react";

export default function barangPage() {
  const [dialogTambahOpen, setDialogTambahOpen] = useState(false);
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const [dialogHapusOpen, setDialogHapusOpen] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const tabelProdukRef = useRef<TabelProdukRef>(null);

  const handleSuccess = () => {
    if (tabelProdukRef.current) {
      tabelProdukRef.current.refresh();
    }
  };

  const handleEdit = (produk: Produk) => {
    setSelectedProduk(produk);
    setDialogEditOpen(true);
  };

  const handleDelete = (produk: Produk) => {
    setSelectedProduk(produk);
    setDialogHapusOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Dashboard Barang</h2>
          <p>Kelola data barang Anda di sini 📋</p>
        </div>
        <Button onClick={() => setDialogTambahOpen(true)}>
          <Plus className="size-4" />
          Tambah Produk
        </Button>
      </div>

      <TabelProduk 
        ref={tabelProdukRef}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DialogTambahProduk
        open={dialogTambahOpen}
        onOpenChange={setDialogTambahOpen}
        onSuccess={handleSuccess}
      />

      <DialogEditProduk
        open={dialogEditOpen}
        onOpenChange={setDialogEditOpen}
        produk={selectedProduk}
        onSuccess={handleSuccess}
      />

      <DialogHapusProduk
        open={dialogHapusOpen}
        onOpenChange={setDialogHapusOpen}
        produk={selectedProduk}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
