import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Penjualan } from "@/app/types/penjualan";
import { useState, useEffect } from "react";
import { addPiutangPayment } from "@/app/services/penjualan.service"; // Will be created
import { formatRupiah } from "@/helper/format";

interface DialogBayarPiutangProps {
  isOpen: boolean;
  onClose: () => void;
  piutang: Penjualan;
  onSuccess: () => void;
}

export default function DialogBayarPiutang({
  isOpen,
  onClose,
  piutang,
  onSuccess,
}: DialogBayarPiutangProps) {
  const [tanggalBayar, setTanggalBayar] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [jumlahBayarInput, setJumlahBayarInput] = useState(
    formatRupiah(jumlahBayar),
  );
  const [metodePembayaran, setMetodePembayaran] = useState("Transfer");
  const [atasNama, setAtasNama] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalDibayar = piutang.totalDibayar || 0;
  const sisaUtang = piutang.total - totalDibayar;

  useEffect(() => {
    // Reset state when dialog opens or piutang changes
    setJumlahBayar(sisaUtang);
    setJumlahBayarInput(formatRupiah(sisaUtang));
    setTanggalBayar(new Date().toISOString().split("T")[0]);
    setError(null);
  }, [isOpen, piutang, sisaUtang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (jumlahBayar <= 0) {
      setError("Jumlah bayar harus lebih dari nol.");
      setIsSubmitting(false);
      return;
    }
    if (jumlahBayar > sisaUtang) {
      setError(
        `Jumlah bayar tidak boleh melebihi sisa utang (${formatRupiah(sisaUtang)}).`,
      );
      setIsSubmitting(false);
      return;
    }
    if (!piutang.id) {
      setError("ID Penjualan tidak ditemukan.");
      setIsSubmitting(false);
      return;
    }

    try {
      await addPiutangPayment(piutang.id, {
        tanggal: tanggalBayar,
        jumlah: jumlahBayar,
        metodePembayaran,
        atasNama,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pembayaran Piutang ({piutang.noInvoice})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label>Nama Pelanggan</Label>
              <Input value={piutang.namaPelanggan || ""} disabled />
            </div>
            <div>
              <Label>Sisa Utang</Label>
              <Input value={formatRupiah(sisaUtang)} disabled />
            </div>
            <div>
              <Label htmlFor="tanggalBayar">Tanggal Bayar</Label>
              <Input
                id="tanggalBayar"
                type="date"
                value={tanggalBayar}
                onChange={(e) => setTanggalBayar(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="jumlahBayar">Jumlah Bayar</Label>
              <Input
                id="jumlahBayar"
                type="text"
                value={jumlahBayarInput}
                onChange={(e) => {
                  const input = e.target.value;
                  setJumlahBayarInput(input);
                  const numeric = input.replace(/[^0-9]/g, "");
                  setJumlahBayar(Number(numeric));
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="metodePembayaran">Metode Pembayaran</Label>
              <select
                id="metodePembayaran"
                value={metodePembayaran}
                onChange={(e) => setMetodePembayaran(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Transfer">Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Debit">Debit</option>
                <option value="Kredit">Kredit</option>
              </select>
            </div>
            <div>
              <Label htmlFor="atasNama">Atas Nama</Label>
              <Input
                id="atasNama"
                type="text"
                value={atasNama}
                onChange={(e) => setAtasNama(e.target.value)}
                placeholder="Masukkan nama pembayar"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Pembayaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
