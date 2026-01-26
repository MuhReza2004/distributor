"use client";

import { useEffect, useState } from "react";
import { createPembelian } from "@/app/services/pembelian.service";
import { PembelianDetail } from "@/app/types/pembelian";
import { addProduk } from "@/app/services/produk.service";
import {} from "@/app/services/supplyer.service";
import { Produk, ProdukFormData } from "@/app/types/produk";
import { Supplier } from "@/app/types/suplyer";

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
import { DialogTambahProduk } from "../produk/DialogTambahProduk";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

interface PembelianFormProps {
  onSuccess?: () => void;
}

export default function PembelianForm({ onSuccess }: PembelianFormProps) {
  const [supplierId, setSupplierId] = useState("");
  const [tanggal, setTanggal] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD format
  });
  const [noDO, setNoDO] = useState("");
  const [noNPB, setNoNPB] = useState("");
  const [invoice, setInvoice] = useState("");
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [items, setItems] = useState<PembelianDetail[]>([]);
  const [isTambahProdukOpen, setIsTambahProdukOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const qProduk = query(collection(db, "produk"), orderBy("nama", "asc"));
    const unsubscribeProduk = onSnapshot(qProduk, (snapshot) => {
      const prods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Produk[];
      setProdukList(prods);
    });

    const qSupplier = query(
      collection(db, "suppliers"),
      orderBy("nama", "asc"),
    );
    const unsubscribeSupplier = onSnapshot(qSupplier, (snapshot) => {
      const sups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Supplier[];
      setSupplierList(sups);
    });

    return () => {
      unsubscribeProduk();
      unsubscribeSupplier();
    };
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        produkId: "",
        qty: 1,
        harga: 0,
        subtotal: 0,
      },
    ]);
  };

  const updateItem = (i: number, field: string, value: any) => {
    const newItems = [...items];
    const item = newItems[i] as any;
    item[field] = value;

    if (field === "produkId") {
      const p = produkList.find((x) => x.id === value);
      if (p) {
        item.harga = p.hargaJual; // assuming harga is hargaJual
      }
    }

    item.subtotal = item.harga * item.qty;
    setItems(newItems);
  };

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  const submit = async () => {
    if (!supplierId) {
      alert("Pilih supplier terlebih dahulu");
      return;
    }
    if (items.some((item) => !item.produkId || !item.qty)) {
      alert("Pastikan semua produk dan kuantitas terisi");
      return;
    }

    setIsLoading(true);
    try {
      await createPembelian({
        supplierId,
        tanggal,
        noDO,
        noNPB,
        invoice,
        total,
        items,
      });

      alert("Pembelian berhasil!");
      setItems([]);
      setNoDO("");
      setNoNPB("");
      setInvoice("");
      setTanggal(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan pembelian");
    } finally {
      setIsLoading(false);
    }
  };

  const checkDuplicateProduct = (nama: string) => {
    if (!nama) return false;
    return produkList.some(
      (p) =>
        p.nama &&
        typeof p.nama === "string" &&
        p.nama.toLowerCase() === nama.toLowerCase(),
    );
  };

  const handleTambahProdukSubmit = async (data: ProdukFormData) => {
    if (checkDuplicateProduct(data.nama)) {
      alert("Produk dengan nama ini sudah ada!");
      return;
    }

    setIsLoading(true);
    try {
      await addProduk(data);

      alert("Produk baru berhasil ditambahkan!");
      setIsTambahProdukOpen(false);
    } catch (error) {
      console.error(error);
      alert("Gagal menambah produk baru");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 max-w-sm">
            <Select
              onValueChange={(val) => {
                setSupplierId(val);
              }}
              value={supplierId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Supplier" />
              </SelectTrigger>
              <SelectContent>
                {supplierList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <Button
            onClick={() => setIsTambahProdukOpen(true)}
            disabled={!supplierId}
            variant="secondary"
          >
            + Tambah Produk Baru
          </Button> */}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
          <Input
            placeholder="Nomor Peneriaman Barang (NPB)"
            value={noNPB}
            onChange={(e) => setNoNPB(e.target.value)}
          />
          <Input
            placeholder="Nomor Delivery Order (DO)"
            value={noDO}
            onChange={(e) => setNoDO(e.target.value)}
          />
          <Input
            placeholder="Invoice / Faktur"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 items-center">
              <Select
                onValueChange={(val) => updateItem(i, "produkId", val)}
                value={item.produkId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Produk" />
                </SelectTrigger>
                <SelectContent>
                  {produkList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nama} {p.stok ? ` (Stok: ${p.stok})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="text"
                min={1}
                value={item.qty}
                onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                placeholder="Qty"
              />
              <Input
                type="text"
                value={"Rp " + item.harga.toLocaleString("id-ID")}
                onChange={(e) => updateItem(i, "harga", Number(e.target.value))}
                placeholder="Harga Beli"
              />

              <div className="font-medium">
                Rp {item.subtotal.toLocaleString("id-ID")}
              </div>

              <Button
                variant="destructive"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              >
                Hapus
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={addItem} variant="outline">
          + Tambah Item Pembelian
        </Button>

        <div className="text-right font-bold text-lg">
          Total: Rp {total.toLocaleString("id-ID")}
        </div>

        <Button onClick={submit} className="w-full" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan Pembelian"}
        </Button>
      </div>

      <DialogTambahProduk
        open={isTambahProdukOpen}
        onOpenChange={setIsTambahProdukOpen}
        onSubmit={handleTambahProdukSubmit}
        isLoading={isLoading}
      />
    </>
  );
}
