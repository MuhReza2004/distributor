"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/helper/format";
import { deleteOrder, getAllOrders } from "@/app/services/order.service";

export default function OrderList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, buyerName: string) => {
    if (confirm(`Hapus order dari ${buyerName}?`)) {
      await deleteOrder(id);
      loadOrders();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">Belum ada order</p>
        <p className="text-gray-400 text-sm mt-2">
          Order yang dibuat akan muncul di sini
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              No. Order
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Nama Pelanggan
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((o, index) => (
            <tr key={o.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  #{String(index + 1).padStart(4, "0")}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(o.createdAt || Date.now()).toLocaleDateString(
                    "id-ID",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {o.buyerName || "Tidak ada nama"}
                </div>
                <div className="text-xs text-gray-500">
                  {o.createdBy || "Admin"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatRupiah(o.total)}
                </div>
                {o.items && (
                  <div className="text-xs text-gray-500">
                    {o.items.length} item
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(o.status)}`}
                >
                  {o.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/orders/${o.id}`}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition shadow-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(o.id, o.buyerName)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition shadow-sm"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Total:{" "}
            <span className="font-semibold text-gray-900">
              {orders.length} order
            </span>
          </span>
          <span className="text-gray-600">
            Total Nilai:{" "}
            <span className="font-semibold text-gray-900">
              {formatRupiah(orders.reduce((sum, o) => sum + o.total, 0))}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
