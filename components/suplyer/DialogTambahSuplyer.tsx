"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { nanoid } from "nanoid";
import {
  Supplier,
  SupplierFormData,
  SupplierProduct,
} from "@/app/types/suplyer";
import { addSupplier } from "@/app/services/supplyer.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DialogTambahSupplier({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState("");
  const [suppiers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    address: "",
    products: [],
    isActive: true,
  });

  /* =====================
     ADD PRODUCT
     ===================== */
  const addProduct = () => {
    if (!productName.trim()) return;

    const newProduct: SupplierProduct = {
      productId: nanoid(),
      name: productName,
    };

    setFormData((p) => ({
      ...p,
      products: [...p.products, newProduct],
    }));

    setProductName("");
  };

  const removeProduct = (id: string) => {
    setFormData((p) => ({
      ...p,
      products: p.products.filter((item) => item.productId !== id),
    }));
  };

  /* =====================
     SUBMIT
     ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addSupplier(formData);

    setLoading(false);
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambah Supplier</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama Supplier</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label>Alamat</Label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData((p) => ({ ...p, address: e.target.value }))
              }
              required
            />
          </div>

          {/* PRODUCT LIST */}
          <div className="space-y-2">
            <Label>Produk Supplier</Label>

            <div className="flex gap-2">
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Nama produk"
              />
              <Button type="button" onClick={addProduct}>
                + Tambah
              </Button>
            </div>

            <ul className="space-y-1">
              {formData.products.map((p) => (
                <li
                  key={p.productId}
                  className="flex justify-between bg-gray-100 px-3 py-2 rounded"
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
