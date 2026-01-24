"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Produk } from "@/app/types/produk";
import { Edit2, Trash2 } from "lucide-react";

interface TabelProdukNewProps {
  products: Produk[];
  isLoading?: boolean;
  onEdit: (product: Produk) => void;
  onDelete: (product: Produk) => void;
  searchTerm?: string;
}

export const TabelProdukNew: React.FC<TabelProdukNewProps> = ({
  products,
  isLoading = false,
  onEdit,
  onDelete,
  searchTerm = "",
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter berdasarkan search
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const search = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.nameProduk.toLowerCase().includes(search) ||
        p.kodeProduk.toLowerCase().includes(search) ||
        p.idProduk.toLowerCase().includes(search),
    );
  }, [products, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Memuat data produk...</div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">
          {products.length === 0
            ? "Belum ada produk"
            : "Produk tidak ditemukan"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-semibold text-gray-700 w-12">
              No
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              ID Produk
            </TableHead>
            <TableHead className="font-semibold text-gray-700">Kode</TableHead>
            <TableHead className="font-semibold text-gray-700">
              Nama Produk
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-center">
              Satuan
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">
              Harga Beli
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">
              Harga Jual
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">
              Stok
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">
              Min Stok
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-center">
              Status
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-center">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product, index) => {
            const isLowStock = product.stok <= product.minimumStok;
            const statusColor =
              product.status === "aktif"
                ? "text-green-600 bg-green-50"
                : "text-red-600 bg-red-50";

            return (
              <TableRow
                key={product.idProduk}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  isLowStock ? "bg-yellow-50" : ""
                }`}
              >
                <TableCell className="text-gray-700 font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="text-gray-700 font-mono text-sm">
                  {product.idProduk}
                </TableCell>
                <TableCell className="text-gray-700 font-semibold text-sm">
                  {product.kodeProduk}
                </TableCell>
                <TableCell className="text-gray-700 font-medium">
                  {product.nameProduk}
                </TableCell>
                <TableCell className="text-center text-gray-600 text-sm">
                  {product.satuan}
                </TableCell>
                <TableCell className="text-right text-gray-700 font-semibold">
                  Rp {product.hargaBeli.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right text-gray-700 font-semibold">
                  Rp {product.hargaJual.toLocaleString("id-ID")}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    isLowStock ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {product.stok}
                  {isLowStock && (
                    <div className="text-xs text-red-600">⚠️ Kurang</div>
                  )}
                </TableCell>
                <TableCell className="text-right text-gray-600 text-sm">
                  {product.minimumStok}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                  >
                    {product.status === "aktif" ? "✓ Aktif" : "✕ Nonaktif"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(product)}
                      className="h-8 px-2"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeletingId(product.idProduk);
                        onDelete(product);
                      }}
                      disabled={deletingId === product.idProduk}
                      className="h-8 px-2"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Footer dengan info */}
      <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-600">
        Menampilkan{" "}
        <span className="font-semibold">{filteredProducts.length}</span> dari{" "}
        <span className="font-semibold">{products.length}</span> produk
        {searchTerm && ` (Pencarian: "${searchTerm}")`}
      </div>
    </div>
  );
};
