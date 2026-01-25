"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Penjualan } from "@/app/types/penjualan";
import { formatRupiah } from "@/helper/format";
import { FileText } from "lucide-react";

interface DialogDetailPenjualanProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  penjualan: Penjualan | null;
}

export const DialogDetailPenjualan: React.FC<DialogDetailPenjualanProps> = ({
  open,
  onOpenChange,
  penjualan,
}) => {
  if (!penjualan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText />
            Detail Penjualan
          </DialogTitle>
          <DialogDescription>
            Rincian untuk invoice #{penjualan.nomorInvoice}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 border">
            <div>
              <p className="text-sm text-gray-500">Pelanggan</p>
              <p className="font-semibold">{penjualan.namaPelanggan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-semibold">
                {new Date(penjualan.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                className={
                  penjualan.status === "Lunas"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }
              >
                {penjualan.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Metode Pembayaran</p>
              <p className="font-semibold capitalize">
                {penjualan.metodePembayaran}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Item yang Dibeli:</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-center">Satuan</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {penjualan.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.namaProduk}</TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-center">
                        {item.satuan}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(item.hargaJual)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end items-center pt-4 border-t">
            <div className="text-right">
              <p className="text-lg font-semibold">Total Pembayaran</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatRupiah(penjualan.total)}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
