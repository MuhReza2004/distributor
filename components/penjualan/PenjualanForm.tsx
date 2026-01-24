"use client";

import { useEffect, useState } from "react";
import {
  createPenjualan,
  generateInvoiceNumber,
} from "@/app/services/penjualan.service";
import { PenjualanItem } from "@/app/types/penjualan";
import { Produk } from "@/app/types/produk";
import { Pelanggan } from "@/app/types/pelanggan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { formatRupiah } from "@/helper/format";
import { AlertCircle } from "lucide-react";

export default function PenjualanForm() {
  const [pelangganId, setPelangganId] = useState("");
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [items, setItems] = useState<PenjualanItem[]>([]);
  const [status, setStatus] = useState<"lunas" | "belum lunas">("lunas");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Generate invoice number on mount
    generateInvoiceNumber().then(setInvoiceNumber);

    const qProduk = query(collection(db, "produk"), orderBy("nameProduk", "asc"));
    const unsubscribeProduk = onSnapshot(qProduk, (snapshot) => {
      const prods = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Produk))
        .filter((p) => p.status === "aktif");
      setProdukList(prods);
    });

    const qPelanggan = query(
      collection(db, "pelanggan"),
      orderBy("namePelanggan", "asc")
    );
    const unsubscribePelanggan = onSnapshot(qPelanggan, (snapshot) => {
      const allPelanggan = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pelanggan[];
      setPelangganList(allPelanggan);
    });

    return () => {
      unsubscribeProduk();
      unsubscribePelanggan();
    };
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { produkId: "", namaProduk: "", hargaJual: 0, qty: 1, subtotal: 0 },
    ]);
  };

  const updateItem = (i: number, field: string, value: any) => {
    const newItems = [...items];
    const item = newItems[i];
    (item as any)[field] = value;

    const produk = produkList.find((p) => p.id === item.produkId);

    if (field === "produkId" && produk) {
      item.namaProduk = produk.nameProduk;
      item.hargaJual = produk.hargaJual;
    }

    if (produk && item.qty > produk.stok) {
        setError(`Stok ${produk.nameProduk} tidak mencukupi (sisa: ${produk.stok})`);
        item.qty = produk.stok;
    } else {
        setError(null);
    }
    
    item.subtotal = item.hargaJual * item.qty;
    setItems(newItems);
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const resetForm = () => {
    setPelangganId("");
    setNamaPelanggan("");
    setItems([]);
    setStatus("lunas");
    generateInvoiceNumber().then(setInvoiceNumber);
  };

  const submit = async () => {
    setError(null);
    if (!pelangganId) {
      alert("Pilih pelanggan terlebih dahulu");
      return;
    }
    if (items.length === 0 || items.some((item) => !item.produkId || !item.qty)) {
      alert("Pastikan ada produk yang dipilih dan kuantitas terisi");
      return;
    }
    
    setIsLoading(true);
    try {
      await createPenjualan({
        nomorInvoice: invoiceNumber,
        pelangganId,
        namaPelanggan,
        tanggal: new Date().toISOString(),
        items,
        total,
        status,
        createdAt: new Date(),
      });

      alert("Penjualan berhasil disimpan!");
      resetForm();
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Gagal menyimpan penjualan");
      alert(error.message || "Gagal menyimpan penjualan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Penjualan Baru</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="w-5 h-5"/> {error}
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Nomor Invoice"
            value={invoiceNumber}
            readOnly
            className="bg-gray-100"
          />
          <Select
            onValueChange={(val) => {
              const p = pelangganList.find((x) => x.id === val);
              if (p) {
                setPelangganId(p.id);
                setNamaPelanggan(p.namePelanggan);
              }
            }}
            value={pelangganId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Pelanggan" />
            </SelectTrigger>
            <SelectContent>
              {pelangganList.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.namePelanggan} - {p.namaToko}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(v: any) => setStatus(v)} value={status}>
            <SelectTrigger>
                <SelectValue placeholder="Status Pembayaran"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="lunas">Lunas</SelectItem>
                <SelectItem value="belum lunas">Belum Lunas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => {
            const selectedProduk = produkList.find(p => p.id === item.produkId);
            return (
                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                    <div className="md:col-span-2">
                        <Select onValueChange={(val) => updateItem(i, "produkId", val)} value={item.produkId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Produk" />
                            </SelectTrigger>
                            <SelectContent>
                                {produkList.map((p) => (
                                <SelectItem key={p.id} value={p.id} disabled={p.stok === 0}>
                                    {p.nameProduk} (Stok: {p.stok})
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Input
                        type="number"
                        min={1}
                        max={selectedProduk?.stok}
                        value={item.qty}
                        onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                        placeholder="Qty"
                        disabled={!item.produkId}
                    />
                    <div className="font-medium text-center">{formatRupiah(item.hargaJual)}</div>
                    <div className="font-medium text-right">{formatRupiah(item.subtotal)}</div>
                    <Button variant="destructive" size="sm" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>Hapus</Button>
                </div>
            )
          })}
        </div>

        <Button onClick={addItem} variant="outline" className="w-full md:w-auto">+ Tambah Produk</Button>

        <div className="text-right font-bold text-lg pr-4">
          Total: {formatRupiah(total)}
        </div>

        <Button onClick={submit} className="w-full" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan Penjualan"}
        </Button>
      </CardContent>
    </Card>
  );
}
