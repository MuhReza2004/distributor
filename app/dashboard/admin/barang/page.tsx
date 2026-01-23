"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import DialogTambahProduk from "@/components/PenerimaanBarang/DialogTambahProduk";
import DialogEditProduk from "@/components/PenerimaanBarang/DialogEditProduk";
import DialogHapusProduk from "@/components/PenerimaanBarang/DialogHapusProduk";
import DialogDetailProduk from "@/components/PenerimaanBarang/DialogDetailProduct";
import { Produk, ProdukFormData } from "@/app/types/produk";
import { Supplier } from "@/app/types/suplyer";
import { getAllSuppliers } from "@/app/services/supplyer.service";
import { Plus } from "lucide-react";
import TabelProduk, {
  TabelProdukRef,
} from "@/components/PenerimaanBarang/TabelPenerimaan";

export default function barangPage() {
  const [dialogTambahOpen, setDialogTambahOpen] = useState(false);
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const [dialogHapusOpen, setDialogHapusOpen] = useState(false);
  const [dialogDetailOpen, setDialogDetailOpen] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const tabelProdukRef = useRef<TabelProdukRef>(null);

  const handleSuccess = () => {
    if (tabelProdukRef.current) {
      tabelProdukRef.current.refresh();
    }
  };

  const handleView = async (produk: Produk) => {
    setSelectedProduk(produk);
    // Fetch supplier berdasarkan nama supplier dari produk
    try {
      const suppliers = await getAllSuppliers();
      const supplier = suppliers.find((s) => s.name === produk.supplyerName);
      setSelectedSupplier(supplier || null);
    } catch (error) {
      console.error("Error fetching supplier:", error);
    }
    setDialogDetailOpen(true);
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
          <h2 className="text-2xl font-bold mb-2"> Penerimaan Barang</h2>
        </div>
        <Button onClick={() => setDialogTambahOpen(true)}>
          <Plus className="size-4" />
          Tambah Produk
        </Button>
      </div>

      <TabelProduk
        ref={tabelProdukRef}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DialogTambahProduk
        open={dialogTambahOpen}
        onOpenChange={setDialogTambahOpen}
        onSuccess={handleSuccess}
      />

      <DialogDetailProduk
        open={dialogDetailOpen}
        onOpenChange={setDialogDetailOpen}
        produk={selectedProduk}
        supplier={selectedSupplier}
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
