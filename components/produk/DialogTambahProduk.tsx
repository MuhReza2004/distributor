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
import { getNewKodeProduk } from "@/app/services/produk.service";
import { formatRupiah } from "@/helper/format";

interface DialogTambahProdukProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProdukFormData) => Promise<void>;
  isLoading?: boolean;
}

const KATEGORI_OPTIONS = [
  { value: "Sembako", label: "Sembako" },
  { value: "lainnya", label: "Lainnya" },
];

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
  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
      minimumStok: 10,
      status: "aktif",
    },
  });

  useEffect(() => {
    if (open) {
      const generateKode = async () => {
        try {
          const newKode = await getNewKodeProduk();
          setValue("kodeProduk", newKode);
        } catch (error) {
          console.error("Error generating kode produk:", error);
        }
      };
      generateKode();
      reset(); // Reset form on open
    }
  }, [open, setValue, reset]);

  const onSubmitForm = async (data: ProdukFormData) => {
    await onSubmit(data);
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
                Kode Produk
              </Label>
              <Input
                id="kodeProduk"
                placeholder="Auto-generated"
                {...register("kodeProduk")}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kategori" className="font-semibold">
                Kategori *
              </Label>
              <select
                id="kategori"
                {...register("kategori", {
                  required: "Kategori wajib dipilih",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {KATEGORI_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.kategori && (
                <p className="text-sm text-red-500">
                  {errors.kategori.message}
                </p>
              )}
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hargaBeli" className="font-semibold">
                Harga Beli *
              </Label>
              <Controller
                control={control}
                name="hargaBeli"
                rules={{
                  required: "Harga beli wajib diisi",
                  min: { value: 1, message: "Harga tidak boleh nol" },
                }}
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
                rules={{
                  required: "Harga jual wajib diisi",
                  min: { value: 1, message: "Harga tidak boleh nol" },
                }}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stok" className="font-semibold">
                Stok Awal *
              </Label>
              <Input
                id="stok"
                type="number"
                placeholder="0"
                {...register("stok", {
                  required: "Stok awal wajib diisi",
                  valueAsNumber: true,
                  min: { value: 0, message: "Stok tidak boleh minus" },
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
