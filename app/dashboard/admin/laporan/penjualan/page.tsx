"use client";

import { useEffect, useState } from "react";
import { Penjualan } from "@/app/types/penjualan";
import { getAllPenjualan } from "@/app/services/penjualan.service";
import { DialogDetailPenjualan } from "@/components/penjualan/DialogDetailPenjualan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/helper/format";
import { Download, Eye, Calendar } from "lucide-react";
import * as ExcelJS from "exceljs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PenjualanReportPage() {
  const [data, setData] = useState<Penjualan[]>([]);
  const [filteredData, setFilteredData] = useState<Penjualan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogDetailOpen, setDialogDetailOpen] = useState(false);
  const [selectedPenjualan, setSelectedPenjualan] = useState<Penjualan | null>(
    null,
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sales = await getAllPenjualan();
        setData(sales);
        setFilteredData(sales);
      } catch (err: any) {
        console.error("Error fetching sales:", err);
        setError("Gagal memuat data penjualan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = data;

    if (startDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.tanggal) >= new Date(startDate),
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.tanggal) <= new Date(endDate),
      );
    }

    setFilteredData(filtered);
  }, [data, startDate, endDate]);

  const handleViewDetails = (penjualan: Penjualan) => {
    setSelectedPenjualan(penjualan);
    setDialogDetailOpen(true);
  };

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Penjualan");

      // Add title
      worksheet.mergeCells("A1:H1");
      worksheet.getCell("A1").value = "Laporan Penjualan";
      worksheet.getCell("A1").font = { size: 16, bold: true };
      worksheet.getCell("A1").alignment = { horizontal: "center" };

      // Add period info
      worksheet.mergeCells("A2:H2");
      const periodText =
        startDate && endDate
          ? `Periode: ${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")}`
          : startDate
            ? `Dari: ${new Date(startDate).toLocaleDateString("id-ID")}`
            : endDate
              ? `Sampai: ${new Date(endDate).toLocaleDateString("id-ID")}`
              : "Semua Periode";
      worksheet.getCell("A2").value = periodText;
      worksheet.getCell("A2").alignment = { horizontal: "center" };

      // Add summary
      worksheet.getCell("A4").value = "Total Penjualan";
      worksheet.getCell("B4").value = totalSales;
      worksheet.getCell("A5").value = "Total Pendapatan";
      worksheet.getCell("B5").value = totalRevenue;
      worksheet.getCell("A6").value = "Penjualan Lunas";
      worksheet.getCell("B6").value = paidSales;
      worksheet.getCell("A7").value = "Penjualan Belum Lunas";
      worksheet.getCell("B7").value = unpaidSales;

      // Add headers
      const headers = [
        "No",
        "Invoice",
        "Surat Jalan",
        "Tanggal",
        "Pelanggan",
        "Alamat",
        "Produk Dibeli",
        "Total",
        "Status",
      ];
      worksheet.addRow([]);
      worksheet.addRow(headers);

      // Style headers
      const headerRow = worksheet.getRow(worksheet.rowCount);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6E6FA" },
      };

      // Add data
      filteredData.forEach((penjualan, index) => {
        const produkDibeli =
          penjualan.items && penjualan.items.length > 0
            ? penjualan.items
                .map(
                  (item) =>
                    `${item.namaProduk} (${item.qty} x ${formatRupiah(item.hargaJual || 0)})`,
                )
                .join("\n")
            : "Tidak ada item";

        const row = [
          index + 1,
          penjualan.noInvoice,
          penjualan.noSuratJalan,
          new Date(penjualan.tanggal).toLocaleDateString("id-ID"),
          penjualan.namaPelanggan || "Pelanggan Tidak Diketahui",
          penjualan.alamatPelanggan || "",
          produkDibeli,
          penjualan.total,
          penjualan.status,
        ];
        worksheet.addRow(row);
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        column.width = 15;
      });
      worksheet.getColumn(5).width = 25; // Pelanggan
      worksheet.getColumn(6).width = 30; // Alamat
      worksheet.getColumn(7).width = 40; // Produk Dibeli

      // Format currency column
      worksheet.getColumn(8).numFmt = '"Rp" #,##0';

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan_penjualan_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Gagal mengekspor laporan Excel. Silakan coba lagi.");
    }
  };

  const totalSales = filteredData.length;
  const totalRevenue = filteredData.reduce((sum, sale) => sum + sale.total, 0);
  const paidSales = filteredData.filter(
    (sale) => sale.status === "Lunas",
  ).length;
  const unpaidSales = filteredData.filter(
    (sale) => sale.status === "Belum Lunas",
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Memuat data laporan penjualan...</div>
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Laporan Penjualan</h1>
        <Button onClick={exportToExcel} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penjualan Lunas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penjualan Belum Lunas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unpaidSales}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data penjualan untuk periode yang dipilih.
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto print:overflow-visible">
              <Table className="print:text-sm print:border-collapse">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Surat Jalan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Produk Dibeli</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((penjualan) => (
                    <TableRow key={penjualan.id}>
                      <TableCell className="font-medium">
                        {penjualan.noInvoice}
                      </TableCell>
                      <TableCell className="font-medium">
                        {penjualan.noSuratJalan}
                      </TableCell>
                      <TableCell>
                        {new Date(penjualan.tanggal).toLocaleDateString(
                          "id-ID",
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {penjualan.namaPelanggan ||
                            "Pelanggan Tidak Diketahui"}
                        </p>
                        {penjualan.alamatPelanggan && (
                          <p className="text-sm text-gray-500">
                            {penjualan.alamatPelanggan}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {penjualan.items && penjualan.items.length > 0 ? (
                          <ul className="list-disc pl-4 text-xs">
                            {penjualan.items.map((item) => (
                              <li key={item.id}>
                                {item.namaProduk} ({item.qty} x{" "}
                                {formatRupiah(item.hargaJual || 0)})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500">
                            Tidak ada item
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(penjualan.total)}
                      </TableCell>
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
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(penjualan)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DialogDetailPenjualan
        open={dialogDetailOpen}
        onOpenChange={setDialogDetailOpen}
        penjualan={selectedPenjualan}
      />
    </div>
  );
}
