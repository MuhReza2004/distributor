"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Penjualan } from "@/app/types/penjualan";
import { formatRupiah } from "@/helper/format";
import { Eye } from "lucide-react";

interface PenjualanTabelProps {
  data: Penjualan[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (penjualan: Penjualan) => void;
  onUpdateStatus: (id: string, status: "Lunas" | "Belum Lunas") => void;
}

export default function PenjualanTabel({
  data,
  isLoading,
  error,
  onViewDetails,
  onUpdateStatus,
}: PenjualanTabelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Memuat data penjualan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Belum ada data penjualan.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Invoice</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((penjualan) => (
            <TableRow key={penjualan.id}>
              <TableCell className="font-medium">
                {penjualan.nomorInvoice}
              </TableCell>
              <TableCell>
                {new Date(penjualan.tanggal).toLocaleDateString("id-ID")}
              </TableCell>
              <TableCell>{penjualan.namaPelanggan}</TableCell>
              <TableCell>{penjualan.items.length}</TableCell>
              <TableCell className="text-right">
                {formatRupiah(penjualan.total)}
              </TableCell>

              {/* === STATUS BADGE (DIPERBAIKI) === */}
              <TableCell className="text-center">
                <Badge
                  className={
                    penjualan.status === "Lunas"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }
                >
                  {penjualan.status}
                </Badge>
              </TableCell>

              {/* === AKSI (DIPERBAIKI) === */}
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(penjualan)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {penjualan.status === "Belum Lunas" && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateStatus(penjualan.id!, "Lunas")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Tandai Lunas
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
