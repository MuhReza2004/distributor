"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProdukFormData } from "@/app/types/produk";
import { Supplier } from "@/app/types/suplyer";
import { formatRupiah } from "@/helper/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produk: ProdukFormData | null;
  supplier: Supplier | null;
}

export default function DialogDetailProduk({
  open,
  onOpenChange,
  produk,
  supplier,
}: Props) {
  if (!produk) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-xl border-0 p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Detail Produk
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Informasi lengkap tentang produk ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section: Informasi Supplier */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Informasi Penerimaan barang
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">
                  Nama Supplier
                </Label>
                <p className="mt-1 text-gray-900">{produk.supplyerName}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Tanggal Penerimaan
                </Label>
                <p className="mt-1 text-gray-900">{produk.dateReceived}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Nomor Kontrak
                </Label>
                <p className="mt-1 text-gray-900">{produk.contractNumber}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Nomor Faktur
                </Label>
                <p className="mt-1 text-gray-900">{produk.invoiceNumber}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  NPB (No Penerimaan Barang)
                </Label>
                <p className="mt-1 text-gray-900">{produk.npb}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Asal Gudang
                </Label>
                <p className="mt-1 text-gray-900">{produk.warehouseOrigin}</p>
              </div>
            </div>
          </div>

          {/* Section: Informasi Produk */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Informasi Produk
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700">
                  Nama Produk
                </Label>
                <p className="mt-1 text-gray-900">{produk.name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Jumlah Barang
                </Label>
                <p className="mt-1 text-gray-900">{produk.stock}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Satuan
                </Label>
                <p className="mt-1 text-gray-900">{produk.unit}</p>
              </div>
            </div>
          </div>

          {/* Section: Informasi Harga */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                3
              </span>
              Informasi Harga
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Harga Beli Satuan
                </Label>
                <p className="mt-1 text-gray-900">
                  {formatRupiah(produk.buyPrice)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Harga pembelian dari supplier
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Jumlah Harga Barang
                </Label>
                <p className="mt-1 text-gray-900">
                  {formatRupiah(produk.buyPrice * produk.stock)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Harga pembelian dari supplier
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Tutup
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
