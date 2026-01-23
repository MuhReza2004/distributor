"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PenerimaanBarang } from "@/app/types/suplyer";
import TabelPenerimaanBarang from "@/components/barang/Tabelbarang";

export default function PenerimaanPage() {
  const [data, setData] = useState<PenerimaanBarang[]>([]);

  useEffect(() => {
    // dummy dulu
    setData([
      {
        id: "1",
        supplierId: "sup-1",
        supplierName: "PT Sumber Jaya",
        tanggal: new Date(),
        items: [
          {
            productId: "p1",
            productName: "Beras Premium",
            unit: "kg",
            qty: 50,
          },
          {
            productId: "p2",
            productName: "Gula Pasir",
            unit: "kg",
            qty: 20,
          },
        ],
        totalItem: 2,
      },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Penerimaan Barang</h1>
        <Button>+ Penerimaan Baru</Button>
      </div>

      <TabelPenerimaanBarang data={data} />
    </div>
  );
}
