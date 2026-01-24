"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { getAllProduk } from "@/app/services/produk.service";
import { Produk } from "@/app/types/produk";
import { Search } from "lucide-react";
import { InventoryTableSimple } from "@/components/barang/InventoryTable";

export default function InventoryPage() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load produk
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getAllProduk();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError("Gagal memuat data produk");
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.kodeProduk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameProduk.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Produk</h1>
        <p className="mt-2 text-gray-600">
          Pantau stok produk, kode produk, dan status inventory
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari kode atau nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <InventoryTableSimple products={filteredProducts} isLoading={isLoading} />
    </div>
  );
}
