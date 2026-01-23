"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Supplier, SupplierProduct } from "@/app/types/suplyer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSave: (supplier: Supplier) => void;
}

export default function EditSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [productName, setProductName] = useState("");

  /* =====================
     INIT DATA
     ===================== */
  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setAddress(supplier.address);
      setIsActive(supplier.isActive);
      setProducts(supplier.products || []);
    }
  }, [supplier]);

  /* =====================
     PRODUCT HANDLER
     ===================== */
  const addProduct = () => {
    if (!productName.trim()) return;

    setProducts((prev) => [
      ...prev,
      {
        productId: nanoid(),
        name: productName,
        unit: "dus",
      },
    ]);

    setProductName("");
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.productId !== id));
  };

  /* =====================
     SAVE
     ===================== */
  const handleSave = () => {
    if (!supplier) return;

    onSave({
      ...supplier,
      name,
      address,
      isActive,
      products,
      updatedAt: new Date(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nama Supplier</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Alamat</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Status Aktif</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* =====================
              PRODUCT LIST
             ===================== */}
          <div className="space-y-2">
            <Label>Produk Supplier</Label>

            <div className="flex gap-2">
              <Input
                placeholder="Nama produk"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Button type="button" onClick={addProduct}>
                + Tambah
              </Button>
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Belum ada produk</p>
            ) : (
              <ul className="space-y-1">
                {products.map((p) => (
                  <li
                    key={p.productId}
                    className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
                  >
                    <span>{p.name}</span>
                    <button
                      type="button"
                      onClick={() => removeProduct(p.productId)}
                      className="text-red-500 text-sm"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan Perubahan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
