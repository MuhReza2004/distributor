"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SupplierProduk } from "@/app/types/suplyer";
import {
  deleteSupplierProduk,
  getAllSupplierProduk,
  updateSupplierProduk,
} from "@/app/services/supplierProduk.service";
import TabelHargaProduk from "@/components/hargaProduk/TabelHargaProduk";
import DialogTambahHargaProduk from "@/components/hargaProduk/DialogTambahHargaProduk";
import DialogEditHargaProduk from "@/components/hargaProduk/DialogEditHargaProduk";

export default function HargaProdukPage() {
  const [data, setData] = useState<SupplierProduk[]>([]);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SupplierProduk | null>(null);

  const fetchData = async () => {
    const res = await getAllSupplierProduk();
    setData(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus supplier produk ini?")) return;
    await deleteSupplierProduk(id);
    fetchData();
  };

  const handleEdit = (item: SupplierProduk) => {
    setSelectedItem(item);
    setOpenEdit(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Supplier Produk</h1>
        <Button onClick={() => setOpen(true)}>+ Tambah Supplier Produk</Button>
      </div>

      <TabelHargaProduk
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DialogTambahHargaProduk
        open={open}
        onOpenChange={setOpen}
        onSuccess={fetchData}
      />

      <DialogEditHargaProduk
        open={openEdit}
        onOpenChange={setOpenEdit}
        item={selectedItem}
        onSuccess={fetchData}
      />
    </div>
  );
}
