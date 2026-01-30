import { Penjualan } from "@/app/types/penjualan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah, formatTanggal } from "@/helper/format";

interface DialogDetailPiutangProps {
  isOpen: boolean;
  onClose: () => void;
  piutang: Penjualan | null;
}

export default function DialogDetailPiutang({
  isOpen,
  onClose,
  piutang,
}: DialogDetailPiutangProps) {
  if (!piutang) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Detail Piutang - {piutang.noInvoice}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informasi Penjualan */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                ℹ️
              </span>
              Informasi Penjualan
            </h3>
            <div className="font-bold">
              <h1>Nama Pelanggan: {piutang.namaPelanggan}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">
                    Total Tagihan:
                  </span>
                  <span className="text-md font-bold ">
                    {formatRupiah(piutang.total)}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center">
                  <span className=" font-medium">Total Dibayar:</span>
                  <span className="text-sm font-semibold ">
                    {formatRupiah(piutang.totalDibayar || 0)}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Sisa Utang:</span>
                  <span className="font-semibold">
                    {formatRupiah(piutang.total - (piutang.totalDibayar || 0))}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Status:</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      piutang.status === "Lunas"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {piutang.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Pembayaran */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                💰
              </span>
              Riwayat Pembayaran
            </h3>
            {piutang.riwayatPembayaran &&
            piutang.riwayatPembayaran.length > 0 ? (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">
                        Tanggal
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Jumlah
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Metode Pembayaran
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Penyetor
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {piutang.riwayatPembayaran.map((payment, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {formatTanggal(payment.tanggal)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatRupiah(payment.jumlah)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {payment.metodePembayaran}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.atasNama}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-gray-400 text-4xl mb-2">💳</div>
                <p className="text-gray-500 font-medium">
                  Belum ada pembayaran tercatat
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Pembayaran akan muncul di sini setelah dilakukan
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
