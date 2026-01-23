"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateProduk } from "@/app/services/produk.service";
import { Produk, ProdukFormData } from "@/app/types/produk";

interface DialogEditProdukProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produk: Produk | null;
  onSuccess?: () => void;
}

export default function DialogEditProduk({
  open,
  onOpenChange,
  produk,
  onSuccess,
}: DialogEditProdukProps) {
  const [formData, setFormData] = useState<ProdukFormData>({
    code: "",
    name: "",
    category: "",
    unit: "dus",
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 0,
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load data produk ke form saat dialog dibuka
  useEffect(() => {
    if (produk && open) {
      setFormData({
        code: produk.code,
        name: produk.name,
        category: produk.category,
        unit: produk.unit,
        buyPrice: produk.buyPrice,
        sellPrice: produk.sellPrice,
        stock: produk.stock,
        minStock: produk.minStock,
        isActive: produk.isActive,
      });
      setMessage(null);
    }
  }, [produk, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produk) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Validasi
      if (!formData.code.trim()) {
        throw new Error("Kode produk harus diisi");
      }
      if (!formData.name.trim()) {
        throw new Error("Nama produk harus diisi");
      }
      if (!formData.category.trim()) {
        throw new Error("Kategori harus diisi");
      }
      if (formData.buyPrice <= 0) {
        throw new Error("Harga beli harus lebih dari 0");
      }
      if (formData.sellPrice <= 0) {
        throw new Error("Harga jual harus lebih dari 0");
      }
      if (formData.stock < 0) {
        throw new Error("Stok tidak boleh negatif");
      }
      if (formData.minStock < 0) {
        throw new Error("Stok minimum tidak boleh negatif");
      }

      // Update ke Firestore
      await updateProduk(produk.id, formData);
      
      setMessage({ type: "success", text: "Produk berhasil diupdate!" });

      // Callback untuk refresh tabel
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          setMessage(null);
        }, 1000);
      } else {
        setTimeout(() => {
          onOpenChange(false);
          setMessage(null);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error updating produk:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Gagal mengupdate produk",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setMessage(null);
      onOpenChange(false);
    }
  };

  if (!produk) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Produk</DialogTitle>
          <DialogDescription>
            Ubah informasi produk yang dipilih
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">
                Kode Produk <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                placeholder="BRG-001"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Nama Produk <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Air Mineral 600ml"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                placeholder="Minuman"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-unit">
                Satuan <span className="text-destructive">*</span>
              </Label>
              <Select
                id="edit-unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="dus">dus</option>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="liter">liter</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-buyPrice">
                Harga Beli <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-buyPrice"
                name="buyPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.buyPrice || ""}
                onChange={handleChange}
                placeholder="40000"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sellPrice">
                Harga Jual <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-sellPrice"
                name="sellPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.sellPrice || ""}
                onChange={handleChange}
                placeholder="50000"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stock">
                Stok <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock || ""}
                onChange={handleChange}
                placeholder="120"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-minStock">
                Stok Minimum <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-minStock"
                name="minStock"
                type="number"
                min="0"
                value={formData.minStock || ""}
                onChange={handleChange}
                placeholder="20"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 flex items-center">
              <input
                id="edit-isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-isActive" className="ml-2 cursor-pointer">
                Produk Aktif
              </Label>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
