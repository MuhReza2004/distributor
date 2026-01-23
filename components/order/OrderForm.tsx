"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/helper/format";
import { Produk } from "@/app/types/produk";
import { OrderItem } from "@/app/types/order";
import { getAllProduk } from "@/app/services/produk.service";
import { createOrder } from "@/app/services/order.service";

export default function OrderForm() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [buyerName, setBuyerName] = useState("");

  useEffect(() => {
    getAllProduk().then(setProduk);
  }, []);

  const addItem = (p: Produk) => {
    setCart((c) => [
      ...c,
      {
        productId: p.id,
        name: p.name,
        price: p.sellPrice,
        qty: 1,
        subtotal: p.sellPrice,
      },
    ]);
  };

  const updateQty = (i: number, qty: number) => {
    setCart((c) =>
      c.map((item, idx) =>
        idx === i ? { ...item, qty, subtotal: qty * item.price } : item,
      ),
    );
  };

  const removeItem = (i: number) => {
    setCart((c) => c.filter((_, idx) => idx !== i));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const submit = async () => {
    if (!buyerName.trim()) {
      alert("Nama pembeli wajib diisi");
      return;
    }

    if (cart.length === 0) {
      alert("Cart masih kosong");
      return;
    }

    await createOrder(cart, "admin", buyerName);
    setCart([]);
    setBuyerName("");
    alert("Order berhasil 🎉");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Buat Order Baru</h2>
          <p className="text-sm text-gray-500 mt-1">
            Isi data pembeli dan pilih produk
          </p>
        </div>

        {/* Nama Pembeli */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Pembeli <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Masukkan nama pembeli"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Pilih Produk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tambah Produk
          </label>
          <select
            onChange={(e) => {
              const p = produk.find((p) => p.id === e.target.value);
              if (p) {
                addItem(p);
                e.target.value = "";
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition cursor-pointer"
          >
            <option value="">-- Pilih produk untuk ditambahkan --</option>
            {produk.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {formatRupiah(p.sellPrice)}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        {cart.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Daftar Produk ({cart.length} item)
            </label>
            <div className="space-y-3">
              {cart.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatRupiah(item.price)} / item
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Qty:</label>
                    <input
                      type="number"
                      value={item.qty}
                      min={1}
                      onChange={(e) => updateQty(i, +e.target.value || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="w-32 text-right">
                    <p className="font-semibold text-gray-800">
                      {formatRupiah(item.subtotal)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(i)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Hapus item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  Total:
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatRupiah(getTotalAmount())}
                </span>
              </div>
            </div>
          </div>
        )}

        {cart.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>Belum ada produk dipilih</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={submit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!buyerName.trim() || cart.length === 0}
          >
            Simpan Order
          </button>
        </div>
      </div>
    </div>
  );
}
