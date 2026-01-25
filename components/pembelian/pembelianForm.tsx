"use client";

import { useEffect, useState } from "react";
import { createPembelian } from "@/app/services/pembelian.service";
import { PembelianItem } from "@/app/types/pembelian";
import { addProduk } from "@/app/services/produk.service";
import {
  addProductToSupplier,
  getAllSuppliers,
} from "@/app/services/supplyer.service";
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
  const [supplierNama, setSupplierNama] = useState("");
  const [npb, setNpb] = useState("");
  const [nomorDO, setNomorDO] = useState("");
  const [nomorKontrak, setNomorKontrak] = useState("");
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [items, setItems] = useState<PembelianItem[]>([]);
  const [isTambahProdukOpen, setIsTambahProdukOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const qProduk = query(
      collection(db, "produk"),
      orderBy("nameProduk", "asc"),
    );
    const unsubscribeProduk = onSnapshot(qProduk, (snapshot) => {
      const prods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Produk[];
      setProdukList(prods);
    });

    const qSupplier = query(
      collection(db, "suppliers"),
      orderBy("name", "asc"),
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
        namaProduk: "",
        hargaBeli: 0,
        qty: 1,
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
        item.namaProduk = p.nameProduk;
        item.hargaBeli = p.hargaBeli;
      }
    }

    item.subtotal = item.hargaBeli * item.qty;
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
        npb,
        nomorDO,
        nomorKontrak,
        supplierId,
        supplierNama,
        tanggal: new Date().toISOString(),
        items,
        total,
        status: "selesai",
        createdAt: new Date(),
      });

      alert("Pembelian berhasil!");
      setItems([]);
      setNpb("");
      setNomorDO("");
      setNomorKontrak("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan pembelian");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTambahProdukSubmit = async (data: ProdukFormData) => {
    setIsLoading(true);
    try {
      const newProdukId = await addProduk(data);
      await addProductToSupplier(supplierId, {
        productId: newProdukId,
        name: data.nameProduk,
      });

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
                const s = supplierList.find((x) => x.id === val);
                if (s) {
                  setSupplierId(s.id);
                  setSupplierNama(s.name);
                }
              }}
              value={supplierId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Supplier" />
              </SelectTrigger>
              <SelectContent>
                {supplierList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setIsTambahProdukOpen(true)}
            disabled={!supplierId}
            variant="secondary"
          >
            + Tambah Produk Baru
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            placeholder="Nomor Kontrak"
            value={nomorKontrak}
            onChange={(e) => setNomorKontrak(e.target.value)}
          />
          <Input
            placeholder="Nomor Peneriaman Barang (NPB)"
            value={npb}
            onChange={(e) => setNpb(e.target.value)}
          />
          <Input
            placeholder="Nomor Delivery Order (DO)"
            value={nomorDO}
            onChange={(e) => setNomorDO(e.target.value)}
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
                      {p.nameProduk} {p.stok ? ` (Stok: ${p.stok})` : ""}
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
                value={"Rp " + item.hargaBeli.toLocaleString("id-ID")}
                onChange={(e) =>
                  updateItem(i, "hargaBeli", Number(e.target.value))
                }
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
