"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { getNewKodeProduk } from "@/app/services/produk.service";

interface DialogTambahProdukProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProdukFormData) => Promise<void>;
  isLoading?: boolean;
}

const SATUAN_OPTIONS = [
  { value: "Sak", label: "Sak" },
  { value: "Pcs", label: "Pcs" },
  { value: "Kg", label: "Kg" },
  { value: "Liter", label: "Liter" },
  { value: "Dus", label: "Dus" },
];

export const DialogTambahProduk: React.FC<DialogTambahProdukProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) => {
  const [hargaJualFormatted, setHargaJualFormatted] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProdukFormData>({
    defaultValues: {
      kode: "",
      nama: "",
      satuan: "Pcs",
      kategori: "",
      hargaJual: 0,
      stok: 0,
      minStok: 0,
      status: "aktif",
    },
  });

  useEffect(() => {
    if (open) {
      reset(); // Reset form on open
      setHargaJualFormatted("");
    }
  }, [open, reset]);

  const formatRupiah = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleHargaJualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = parseInt(rawValue) || 0;
    setValue("hargaJual", numericValue);
    setHargaJualFormatted(formatRupiah(rawValue));
  };

  const onSubmitForm = async (data: ProdukFormData) => {
    const kode = await getNewKodeProduk();
    const dataWithKode = { ...data, kode };
    await onSubmit(dataWithKode);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Isi informasi produk di bawah ini. Kode Produk akan dibuat otomatis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nama" className="font-semibold">
              Nama Produk *
            </Label>
            <Input
              id="nama"
              placeholder="Masukkan nama produk"
              {...register("nama", {
                required: "Nama produk wajib diisi",
                minLength: { value: 3, message: "Minimal 3 karakter" },
              })}
              className={errors.nama ? "border-red-500" : ""}
            />
            {errors.nama && (
              <p className="text-sm text-red-500">{errors.nama.message}</p>
            )}
          </div>

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
              <Label htmlFor="kategori" className="font-semibold">
                Kategori *
              </Label>
              <Input
                id="kategori"
                placeholder="Masukkan kategori"
                {...register("kategori", {
                  required: "Kategori wajib diisi",
                })}
                className={errors.kategori ? "border-red-500" : ""}
              />
              {errors.kategori && (
                <p className="text-sm text-red-500">
                  {errors.kategori.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hargaJual" className="font-semibold">
                Harga Jual *
              </Label>
              <Input
                id="hargaJual"
                type="text"
                placeholder="Masukkan harga jual"
                value={hargaJualFormatted}
                onChange={handleHargaJualChange}
                className={errors.hargaJual ? "border-red-500" : ""}
              />
              {errors.hargaJual && (
                <p className="text-sm text-red-500">
                  {errors.hargaJual.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stok" className="font-semibold">
                Stok *
              </Label>
              <Input
                id="stok"
                type="number"
                placeholder="Masukkan stok"
                {...register("stok", {
                  required: "Stok wajib diisi",
                  min: { value: 0, message: "Stok minimal 0" },
                })}
                className={errors.stok ? "border-red-500" : ""}
              />
              {errors.stok && (
                <p className="text-sm text-red-500">{errors.stok.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStok" className="font-semibold">
                Minimum Stok *
              </Label>
              <Input
                id="minStok"
                type="number"
                placeholder="Masukkan minimum stok"
                {...register("minStok", {
                  required: "Minimum stok wajib diisi",
                  min: { value: 0, message: "Minimum stok minimal 0" },
                })}
                className={errors.minStok ? "border-red-500" : ""}
              />
              {errors.minStok && (
                <p className="text-sm text-red-500">{errors.minStok.message}</p>
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
