"use client";

import { useEffect, useState } from "react";
import { SupplierProduk } from "@/app/types/suplyer";
import { Button } from "@/components/ui/button";
import { getAllSuppliers } from "@/app/services/supplyer.service";
import { getAllProduk } from "@/app/services/produk.service";
import { Supplier } from "@/app/types/suplyer";
import { Produk } from "@/app/types/produk";
import { formatRupiah } from "@/helper/format";

interface Props {
  data: SupplierProduk[];
  onEdit: (item: SupplierProduk) => void;
  onDelete: (id: string) => void;
}

export default function TabelHargaProduk({ data, onEdit, onDelete }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Produk[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [sups, prods] = await Promise.all([
        getAllSuppliers(),
        getAllProduk(),
      ]);
      setSuppliers(sups);
      setProducts(prods);
    };
    fetchData();
  }, []);

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.nama || supplierId;
  };

  const getProductName = (produkId: string) => {
    const product = products.find((p) => p.id === produkId);
    return product?.nama || produkId;
  };

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3">No</th>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Produk</th>
            <th className="px-4 py-3">Harga Beli</th>
            <th className="px-4 py-3">Harga Jual</th>
            <th className="px-4 py-3">Stok</th>
            <th className="px-4 py-3 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className="border-t">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3">{getSupplierName(item.supplierId)}</td>
              <td className="px-4 py-3">{getProductName(item.produkId)}</td>
              <td className="px-4 py-3">{formatRupiah(item.hargaBeli)}</td>
              <td className="px-4 py-3">{formatRupiah(item.hargaJual)}</td>
              <td className="px-4 py-3">{item.stok}</td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <Button size="sm" onClick={() => onEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
