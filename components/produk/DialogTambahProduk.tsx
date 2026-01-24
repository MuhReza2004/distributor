"use client";

import React, { useEffect } from "react";
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
    formState: { errors },
  } = useForm<ProdukFormData>({
    defaultValues: {
      nameProduk: "",
      kodeProduk: "",
      kategori: "",
      satuan: "",
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
    }
  }, [open, setValue]);

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
            Isi informasi produk di bawah ini. Kode Produk akan dibuat
            otomatis.
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
              <Input
                id="kategori"
                placeholder="Misal: Makanan"
                {...register("kategori", { required: "Kategori wajib diisi" })}
                className={errors.kategori ? "border-red-500" : ""}
              />
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
              <Input
                id="satuan"
                placeholder="Misal: pcs, kg, liter"
                {...register("satuan", { required: "Satuan wajib diisi" })}
                className={errors.satuan ? "border-red-500" : ""}
              />
              {errors.satuan && (
                <p className="text-sm text-red-500">
                  {errors.satuan.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hargaBeli" className="font-semibold">
                Harga Beli *
              </Label>
              <Input
                id="hargaBeli"
                type="number"
                placeholder="0"
                {...register("hargaBeli", {
                  required: "Harga beli wajib diisi",
                  valueAsNumber: true,
                })}
                className={errors.hargaBeli ? "border-red-500" : ""}
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
              <Input
                id="hargaJual"
                type="number"
                placeholder="0"
                {...register("hargaJual", {
                  required: "Harga jual wajib diisi",
                  valueAsNumber: true,
                })}
                className={errors.hargaJual ? "border-red-500" : ""}
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
                <p className="text-sm text-red-500">
                  {errors.stok.message}
                </p>
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