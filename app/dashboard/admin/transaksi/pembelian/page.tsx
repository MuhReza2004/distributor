"use client";

import { useEffect, useState } from "react";

import { getAllPembelian } from "@/app/services/pembelian.service";
import { Pembelian } from "@/app/types/pembelian";
import PembelianForm from "@/components/pembelian/pembelianForm";
import PembelianTable from "@/components/pembelian/pembelianTabel";

export default function PagePembelian() {
  const [data, setData] = useState<Pembelian[]>([]);

  const loadData = async () => {
    const res = await getAllPembelian();
    setData(res);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <PembelianForm onSuccess={loadData} />
      <PembelianTable data={data} />
    </div>
  );
}
