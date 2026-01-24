"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTambahProduk } from "@/components/produk/DialogTambahProdukNew";
import { DialogEditProduk } from "@/components/produk/DialogEditProdukNew";
import { DialogHapusProduk } from "@/components/produk/DialogHapusProdukNew";
import { DialogProdukDuplikat } from "@/components/produk/DialogProdukDuplikat";
import { TabelProdukNew } from "@/components/produk/TabelProdukNew";
import {
  getAllProduk,
  addProduk,
  updateProduk,
  deleteProduk,
} from "@/app/services/produk.service";
import { Produk, ProdukFormData } from "@/app/types/produk";
import { Plus, Search } from "lucide-react";

export default function ProdukAdminPage() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [dialogTambahOpen, setDialogTambahOpen] = useState(false);
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const [dialogHapusOpen, setDialogHapusOpen] = useState(false);
  const [dialogDuplikatOpen, setDialogDuplikatOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produk | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplikasi produk states
  const [pendingNewData, setPendingNewData] = useState<ProdukFormData | null>(
    null,
  );
  const [existingDuplicateProduct, setExistingDuplicateProduct] =
    useState<Produk | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");

  // Load produk
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getAllProduk();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError("Gagal memuat data produk");
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Show success message
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Cek apakah produk dengan nama yang sama sudah ada
  const checkDuplicateProduct = (nameProduk: string) => {
    return products.find(
      (p) =>
        p.nameProduk.toLowerCase().trim() === nameProduk.toLowerCase().trim(),
    );
  };

  // Handle tambah produk dengan validasi duplikasi
  const handleTambahSubmit = async (data: ProdukFormData) => {
    // Cek duplikasi
    const duplicate = checkDuplicateProduct(data.nameProduk);

    if (duplicate) {
      // Produk dengan nama sama ditemukan
      setExistingDuplicateProduct(duplicate);
      setPendingNewData(data);
      setDialogDuplikatOpen(true);
      setDialogTambahOpen(false);
      return;
    }

    // Produk baru, langsung tambahkan
    try {
      setIsSubmitting(true);
      const newId = await addProduk(data);
      const newProduct: Produk = {
        idProduk: newId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      showSuccess("Produk berhasil ditambahkan");
      setDialogTambahOpen(false);
    } catch (err) {
      setError("Gagal menambah produk");
      console.error("Error adding product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tambah stok (duplikasi produk)
  const handleAddStok = async () => {
    if (!existingDuplicateProduct || !pendingNewData) return;

    try {
      setIsSubmitting(true);
      // Update stok produk yang ada
      const updatedData: ProdukFormData = {
        ...existingDuplicateProduct,
        stok: existingDuplicateProduct.stok + pendingNewData.stok,
      };

      await updateProduk(existingDuplicateProduct.idProduk, updatedData);

      // Update state
      setProducts((prev) =>
        prev.map((p) =>
          p.idProduk === existingDuplicateProduct.idProduk
            ? {
                ...p,
                stok: p.stok + pendingNewData.stok,
                updatedAt: new Date(),
              }
            : p,
        ),
      );

      showSuccess(
        `Stok berhasil ditambahkan. Total stok sekarang: ${
          existingDuplicateProduct.stok + pendingNewData.stok
        } ${existingDuplicateProduct.satuan}`,
      );

      setDialogDuplikatOpen(false);
      setExistingDuplicateProduct(null);
      setPendingNewData(null);
    } catch (err) {
      setError("Gagal menambah stok");
      console.error("Error adding stock:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tambah produk baru (meskipun ada duplikasi)
  const handleAddNewAnyway = async () => {
    if (!pendingNewData) return;

    try {
      setIsSubmitting(true);
      const newId = await addProduk(pendingNewData);
      const newProduct: Produk = {
        idProduk: newId,
        ...pendingNewData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      showSuccess("Produk baru berhasil ditambahkan (duplikasi nama produk)");

      setDialogDuplikatOpen(false);
      setExistingDuplicateProduct(null);
      setPendingNewData(null);
    } catch (err) {
      setError("Gagal menambah produk baru");
      console.error("Error adding new product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit produk
  const handleEditSubmit = async (data: ProdukFormData) => {
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      await updateProduk(selectedProduct.idProduk, data);
      setProducts((prev) =>
        prev.map((p) =>
          p.idProduk === selectedProduct.idProduk
            ? { ...p, ...data, updatedAt: new Date() }
            : p,
        ),
      );
      showSuccess("Produk berhasil diupdate");
      setDialogEditOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      setError("Gagal mengupdate produk");
      console.error("Error updating product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit produk (button click)
  const handleEditClick = (product: Produk) => {
    setSelectedProduct(product);
    setDialogEditOpen(true);
  };

  // Handle delete produk
  const handleDeleteClick = (product: Produk) => {
    setSelectedProduct(product);
    setDialogHapusOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      await deleteProduk(selectedProduct.idProduk);
      setProducts((prev) =>
        prev.filter((p) => p.idProduk !== selectedProduct.idProduk),
      );
      showSuccess("Produk berhasil dihapus");
      setDialogHapusOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      setError("Gagal menghapus produk");
      console.error("Error deleting product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Produk</h1>
        <p className="mt-2 text-gray-600">
          Kelola produk, harga, stok, dan status di sini
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Search & Button Bar */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex gap-4 items-end">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari ID, kode, atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tombol Tambah */}
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setDialogTambahOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <TabelProdukNew
        products={products}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        searchTerm={searchTerm}
      />

      {/* Dialog Tambah */}
      <DialogTambahProduk
        open={dialogTambahOpen}
        onOpenChange={setDialogTambahOpen}
        onSubmit={handleTambahSubmit}
        isLoading={isSubmitting}
      />

      {/* Dialog Edit */}
      <DialogEditProduk
        open={dialogEditOpen}
        onOpenChange={setDialogEditOpen}
        onSubmit={handleEditSubmit}
        produk={selectedProduct}
        isLoading={isSubmitting}
      />

      {/* Dialog Hapus */}
      <DialogHapusProduk
        open={dialogHapusOpen}
        onOpenChange={setDialogHapusOpen}
        onConfirm={handleDeleteConfirm}
        produk={selectedProduct}
        isLoading={isSubmitting}
      />

      {/* Dialog Produk Duplikat */}
      <DialogProdukDuplikat
        open={dialogDuplikatOpen}
        onOpenChange={setDialogDuplikatOpen}
        existingProduct={existingDuplicateProduct}
        newData={pendingNewData}
        onAddStok={handleAddStok}
        onAddNew={handleAddNewAnyway}
        isLoading={isSubmitting}
      />
    </div>
  );
}
