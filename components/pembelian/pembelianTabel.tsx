"use client";

import { Pembelian } from "@/app/types/pembelian";
import { formatRupiah } from "@/helper/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, FileText, Truck, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function PembelianTable({ data }: { data: Pembelian[] }) {
  // Hitung total per bulan
  const totalPerBulan = useMemo(() => {
    const grouped = data.reduce(
      (acc, p) => {
        const date = new Date(p.tanggal);
        const bulanTahun = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        const namaBulan = date.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });

        if (!acc[bulanTahun]) {
          acc[bulanTahun] = {
            nama: namaBulan,
            total: 0,
            jumlahTransaksi: 0,
          };
        }

        acc[bulanTahun].total += p.total;
        acc[bulanTahun].jumlahTransaksi += 1;

        return acc;
      },
      {} as Record<
        string,
        { nama: string; total: number; jumlahTransaksi: number }
      >,
    );

    return Object.values(grouped).sort((a, b) => b.nama.localeCompare(a.nama));
  }, [data]);

  // Hitung grand total
  const grandTotal = useMemo(() => {
    return data.reduce((sum, p) => sum + p.total, 0);
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Supplier
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tanggal
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  DO
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  NPB
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Invoice
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Nama Produk
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">
                Qty
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">
                Harga
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-gray-500"
                >
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Belum ada data pembelian</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((p, idx) => (
                <TableRow
                  key={p.id}
                  className={`hover:bg-blue-50/50 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <TableCell className="font-medium text-gray-900">
                    {p.supplierNama}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(p.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {p.nomorDO ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {p.nomorDO}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.npb ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {p.npb}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.nomorFaktur ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {p.nomorFaktur}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.items.length > 1 ? (
                      <div className="space-y-1">
                        {p.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span className="text-gray-700">
                              {item.namaProduk}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-700">
                        {p.items[0]?.namaProduk}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.items.length > 1 ? (
                      <div className="space-y-1">
                        {p.items.map((item, index) => (
                          <div
                            key={index}
                            className="text-sm font-medium text-gray-700"
                          >
                            {item.qty}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-medium text-gray-700">
                        {p.items[0]?.qty}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.items.length > 1 ? (
                      <div className="space-y-1">
                        {p.items.map((item, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 font-mono"
                          >
                            {formatRupiah(item.hargaBeli)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-600 font-mono">
                        {formatRupiah(p.items[0]?.hargaBeli)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-blue-600 text-base">
                      {formatRupiah(p.total)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {data.length > 0 && (
            <TableFooter>
              <TableRow className=" bg-green-600">
                <TableCell
                  colSpan={7}
                  className="text-white font-bold text-base"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 " />
                    TOTAL KESELURUHAN
                  </div>
                </TableCell>
                <TableCell className="text-right text-white font-bold text-lg">
                  {formatRupiah(grandTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Summary Card - Total Per Bulan */}
      {data.length > 0 && totalPerBulan.length > 0 && (
        <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Ringkasan Modal Per Bulan
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {totalPerBulan.map((bulan, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {bulan.nama}
                      </p>
                      <p className="text-xs text-gray-400">
                        {bulan.jumlahTransaksi} transaksi
                      </p>
                    </div>
                    <div className="bg-emerald-100 rounded-full p-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatRupiah(bulan.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
