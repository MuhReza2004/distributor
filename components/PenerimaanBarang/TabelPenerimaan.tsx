"use client";

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { getAllProduk } from "@/app/services/produk.service";
import { Produk } from "@/app/types/produk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";

export interface TabelProdukRef {
  refresh: () => void;
}

interface TabelProdukProps {
  onView?: (produk: Produk) => void;
  onEdit?: (produk: Produk) => void;
  onDelete?: (produk: Produk) => void;
}

const TabelProduk = forwardRef<TabelProdukRef, TabelProdukProps>(
  ({ onView, onEdit, onDelete }, ref) => {
    const [produk, setProduk] = useState<Produk[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProduk = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllProduk();
        setProduk(data);
      } catch (err: any) {
        console.error("Error fetching produk:", err);

        if (
          err?.code === "permission-denied" ||
          err?.message?.includes("permission")
        ) {
          setError(
            "Akses ditolak. Silakan atur Firestore Security Rules untuk collection 'produk'.",
          );
        } else {
          setError(err?.message || "Gagal memuat data produk");
        }
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: fetchProduk,
    }));

    useEffect(() => {
      fetchProduk();
    }, []);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const getStockStatusClass = (stock: number) => {
      if (stock === 0) {
        return "bg-red-100 text-red-800 border-red-200";
      } else if (stock < 10) {
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      } else {
        return "bg-green-100 text-green-800 border-green-200";
      }
    };

    const getStockLabel = (stock: number) => {
      if (stock === 0) return "Habis";
      if (stock < 10) return "Stok Rendah";
      return "Tersedia";
    };

    if (isLoading) {
      return (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data produk...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                <p className="font-semibold mb-2">Terjadi Kesalahan</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800">
              Daftar Penerimaan Barang
            </CardTitle>
            <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
              {produk.length} Produk
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {produk.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <div className="text-gray-400 mb-2">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                Belum ada Barang yang diterima
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Tambah produk baru untuk memulai
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      No
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Nama Produk
                    </th>
                    <th className="text-right p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Harga Beli
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      jumlah Barang
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      jumlah harga
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {produk.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          {item.code && (
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {item.code}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.buyPrice)}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {item.stock}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusClass(
                              item.stock,
                            )}`}
                          >
                            {getStockLabel(item.stock)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.buyPrice * item.stock)}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onView?.(item)}
                            className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit?.(item)}
                            className="h-9 w-9 p-0 hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete?.(item)}
                            className="h-9 w-9 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Footer Summary */}
        {produk.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <div className="flex gap-6">
                <span className="text-gray-600">
                  Total Produk:{" "}
                  <span className="font-semibold text-gray-900">
                    {produk.length}
                  </span>
                </span>
                <span className="text-gray-600">
                  Stok Habis:{" "}
                  <span className="font-semibold text-red-600">
                    {produk.filter((p) => p.stock === 0).length}
                  </span>
                </span>
                <span className="text-gray-600">
                  Stok Rendah:{" "}
                  <span className="font-semibold text-yellow-600">
                    {produk.filter((p) => p.stock > 0 && p.stock < 10).length}
                  </span>
                </span>
              </div>
              <span className="text-gray-600">
                Total Nilai Barang:{" "}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(
                    produk.reduce((sum, p) => sum + p.buyPrice * p.stock, 0),
                  )}
                </span>
              </span>
            </div>
          </div>
        )}
      </Card>
    );
  },
);

TabelProduk.displayName = "TabelProduk";

export default TabelProduk;
