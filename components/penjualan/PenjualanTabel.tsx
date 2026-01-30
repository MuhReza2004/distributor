import { Penjualan, PenjualanDetail } from "@/app/types/penjualan";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatTanggal } from "@/helper/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DialogBayarPiutang from "@/app/dashboard/admin/transaksi/piutang/DialogBayarPiutang";

interface PiutangTableProps {
  piutang: Penjualan[];
  onPaymentSuccess: () => void;
}

export default function PiutangTable({
  piutang,
  onPaymentSuccess,
}: PiutangTableProps) {
  const [selectedPiutang, setSelectedPiutang] = useState<Penjualan | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPiutangDetail, setSelectedPiutangDetail] =
    useState<Penjualan | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleOpenDialog = (p: Penjualan) => {
    setSelectedPiutang(p);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedPiutang(null);
    setIsDialogOpen(false);
  };

  const handleOpenDetailDialog = (p: Penjualan) => {
    setSelectedPiutangDetail(p);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setSelectedPiutangDetail(null);
    setIsDetailDialogOpen(false);
  };

  const handlePaymentSuccess = () => {
    handleCloseDialog();
    onPaymentSuccess();
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Invoice</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama Pelanggan</TableHead>
            <TableHead>Total Tagihan</TableHead>
            <TableHead>Total Dibayar</TableHead>
            <TableHead>Sisa Utang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {piutang.map((p) => {
            const totalDibayar = p.totalDibayar || 0;
            const sisaUtang = p.total - totalDibayar;
            return (
              <TableRow key={p.id}>
                <TableCell>{p.noInvoice}</TableCell>
                <TableCell>{formatTanggal(p.tanggal)}</TableCell>
                <TableCell>{p.namaPelanggan}</TableCell>
                <TableCell>{formatRupiah(p.total)}</TableCell>
                <TableCell>{formatRupiah(totalDibayar)}</TableCell>
                <TableCell>{formatRupiah(sisaUtang)}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      p.status === "Lunas"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {p.status === "Belum Lunas" && (
                      <Button onClick={() => handleOpenDialog(p)}>Bayar</Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleOpenDetailDialog(p)}
                    >
                      Detail
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedPiutang && (
        <DialogBayarPiutang
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          piutang={selectedPiutang}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {selectedPiutangDetail && (
        <Dialog
          open={isDetailDialogOpen}
          onOpenChange={handleCloseDetailDialog}
        >
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold">
                Riwayat Pembayaran
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Invoice: {selectedPiutangDetail.noInvoice}
              </p>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Informasi Penjualan */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Informasi Penjualan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Total Tagihan
                    </span>
                    <p className="font-bold text-xl text-gray-900 mt-1">
                      {formatRupiah(selectedPiutangDetail.total)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Total Dibayar
                    </span>
                    <p className="font-bold text-xl text-green-600 mt-1">
                      {formatRupiah(selectedPiutangDetail.totalDibayar || 0)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Sisa Utang
                    </span>
                    <p className="font-bold text-xl text-red-600 mt-1">
                      {formatRupiah(
                        selectedPiutangDetail.total -
                          (selectedPiutangDetail.totalDibayar || 0),
                      )}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Status Pembayaran
                    </span>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-full ${
                          selectedPiutangDetail.status === "Lunas"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                        }`}
                      >
                        {selectedPiutangDetail.status === "Lunas" ? (
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {selectedPiutangDetail.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Riwayat Pembayaran */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  Riwayat Pembayaran
                </h3>
                {selectedPiutangDetail.riwayatPembayaran &&
                selectedPiutangDetail.riwayatPembayaran.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <TableHead className="font-bold text-gray-700">
                            Tanggal
                          </TableHead>
                          <TableHead className="font-bold text-gray-700">
                            Jumlah
                          </TableHead>
                          <TableHead className="font-bold text-gray-700">
                            Metode Pembayaran
                          </TableHead>
                          <TableHead className="font-bold text-gray-700">
                            Atas Nama
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPiutangDetail.riwayatPembayaran.map(
                          (payment, index) => (
                            <TableRow
                              key={index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {formatTanggal(payment.tanggal)}
                              </TableCell>
                              <TableCell className="font-bold text-green-600">
                                {formatRupiah(payment.jumlah)}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
                                  {payment.metodePembayaran}
                                </span>
                              </TableCell>
                              <TableCell className="text-gray-700">
                                {payment.atasNama}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      Belum ada pembayaran
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Riwayat pembayaran akan muncul di sini
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
