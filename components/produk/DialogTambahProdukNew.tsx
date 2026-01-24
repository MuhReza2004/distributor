"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProdukFormData } from "@/app/types/produk";
import { formatRupiah } from "@/helper/format";

interface DialogTambahProdukProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProdukFormData) => Promise<void>;
  isLoading?: boolean;
}

const SATUAN_OPTIONS = [
  { value: "sak", label: "Sak" },
  { value: "pcs", label: "Pcs" },
  { value: "kg", label: "Kg" },
  { value: "liter", label: "Liter" },
];

export const DialogTambahProduk: React.FC<DialogTambahProdukProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<ProdukFormData>({
    defaultValues: {
      nameProduk: "",
      kodeProduk: "",
      kategori: "lainnya",
      satuan: "pcs",
      hargaBeli: 0,
      hargaJual: 0,
      stok: 0,
      minimumStok: 0,
      status: "aktif",
    },
  });

  const hargaBeli = watch("hargaBeli");
  const hargaJual = watch("hargaJual");

  const onSubmitForm = async (data: ProdukFormData) => {
    await onSubmit(data);
    reset();
  };

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Isi informasi produk di bawah ini. ID Produk akan dibuat otomatis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Row 1: Nama & Kode */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameProduk" className="font-semibold">
                Nama Produk *
              </Label>
              <Input
                id="nameProduk"
                placeholder="Masukkan nama produk"
                {...register("nameProduk", {
                  required: "Nama produk wajib diisi",
                  minLength: { value: 3, message: "Minimal 3 karakter" },
                })}
                className={errors.nameProduk ? "border-red-500" : ""}
              />
              {errors.nameProduk && (
                <p className="text-sm text-red-500">
                  {errors.nameProduk.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kodeProduk" className="font-semibold">
                Kode Produk (SKU) *
              </Label>
              <Input
                id="kodeProduk"
                placeholder="Misal: SKU-001"
                {...register("kodeProduk", {
                  required: "Kode produk wajib diisi",
                  minLength: { value: 3, message: "Minimal 3 karakter" },
                })}
                className={errors.kodeProduk ? "border-red-500" : ""}
              />
              {errors.kodeProduk && (
                <p className="text-sm text-red-500">
                  {errors.kodeProduk.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Satuan & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="satuan" className="font-semibold">
                Satuan *
              </Label>
              <select
                id="satuan"
                {...register("satuan", { required: "Satuan wajib dipilih" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SATUAN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.satuan && (
                <p className="text-sm text-red-500">{errors.satuan.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-semibold">
                Status *
              </Label>
              <select
                id="status"
                {...register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Row 3: Harga Beli & Harga Jual */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hargaBeli" className="font-semibold">
                Harga Beli *
              </Label>
              <Controller
                control={control}
                name="hargaBeli"
                rules={{ required: "Harga beli wajib diisi" }}
                render={({ field }) => (
                  <Input
                    id="hargaBeli"
                    inputMode="numeric"
                    placeholder="Rp 0"
                    value={field.value ? formatRupiah(field.value) : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      field.onChange(Number(raw));
                    }}
                    className={errors.hargaBeli ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.hargaBeli && (
                <p className="text-sm text-red-500">
                  {errors.hargaBeli.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hargaJual" className="font-semibold">
                Harga Jual *
              </Label>
              <Controller
                control={control}
                name="hargaJual"
                rules={{ required: "Harga jual wajib diisi" }}
                render={({ field }) => (
                  <Input
                    id="hargaJual"
                    inputMode="numeric"
                    placeholder="Rp 0"
                    value={field.value ? formatRupiah(field.value) : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      field.onChange(Number(raw));
                    }}
                    className={errors.hargaJual ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.hargaJual && (
                <p className="text-sm text-red-500">
                  {errors.hargaJual.message}
                </p>
              )}
            </div>
          </div>

          {/* Margin Info */}
          {hargaBeli > 0 && hargaJual > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              Margin Profit: Rp{" "}
              {(hargaJual - hargaBeli).toLocaleString("id-ID")} (
              {Math.round(((hargaJual - hargaBeli) / hargaBeli) * 100)}%)
            </div>
          )}

          {/* Row 4: Stok & Minimum Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stok" className="font-semibold">
                Stok Saat Ini *
              </Label>
              <Input
                id="stok"
                type="number"
                placeholder="0"
                {...register("stok", {
                  required: "Stok wajib diisi",
                  min: { value: 0, message: "Stok tidak boleh negatif" },
                  valueAsNumber: true,
                })}
                className={errors.stok ? "border-red-500" : ""}
              />
              {errors.stok && (
                <p className="text-sm text-red-500">{errors.stok.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumStok" className="font-semibold">
                Minimum Stok *
              </Label>
              <Input
                id="minimumStok"
                type="number"
                placeholder="0"
                {...register("minimumStok", {
                  required: "Minimum stok wajib diisi",
                  min: {
                    value: 0,
                    message: "Minimum stok tidak boleh negatif",
                  },
                  valueAsNumber: true,
                })}
                className={errors.minimumStok ? "border-red-500" : ""}
              />
              {errors.minimumStok && (
                <p className="text-sm text-red-500">
                  {errors.minimumStok.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Tambah Produk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
