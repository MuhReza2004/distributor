"use client";

import { Supplier } from "@/app/types/suplyer";
import { Button } from "@/components/ui/button";

interface Props {
  data: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onDetail: (supplier: Supplier) => void;
}

export default function SupplierTable({
  data,
  onEdit,
  onDelete,
  onDetail,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3">No</th>
            <th className="px-4 py-3">Nama</th>
            <th className="px-4 py-3">Alamat</th>
            <th className="px-4 py-3">Produk</th>
            <th className="px-4 py-3 text-center">Jumlah</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {data.map((supplier, index) => (
            <tr key={supplier.id} className="border-t">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{supplier.name}</td>
              <td className="px-4 py-3">{supplier.address}</td>

              <td className="px-4 py-3">
                <ul className="space-y-1">
                  {supplier.products.map((p) => (
                    <li
                      key={p.productId}
                      className="rounded  px-2 py-1 text-xs text-blue-700 list-disc list-inside"
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              </td>

              <td className="px-4 py-3 text-center">
                {supplier.products.length}
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    supplier.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {supplier.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  {/* <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDetail(supplier)}
                  >
                    Detail
                  </Button> */}
                  <Button size="sm" onClick={() => onEdit(supplier)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(supplier.id)}
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
