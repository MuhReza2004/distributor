"use client";

import { useEffect, useState } from "react";

import { getAllPembelian } from "@/app/services/pembelian.service";
import { Pembelian } from "@/app/types/pembelian";
import PembelianForm from "@/components/pembelian/pembelianForm";
import PembelianTable from "@/components/pembelian/pembelianTabel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PagePembelian() {
  const [data, setData] = useState<Pembelian[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadData = async () => {
    const res = await getAllPembelian();
    setData(res);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    loadData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transaksi Pembelian</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Tambah Pembelian</Button>
      </div>
      <PembelianTable data={data} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaksi Pembelian</DialogTitle>
          </DialogHeader>
          <PembelianForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
