export interface PenjualanDetail {
  id?: string;
  penjualanId?: string;
  produkId: string;
  qty: number;
  harga: number;
  subtotal: number;
}

export interface Penjualan {
  id?: string;
  nomorInvoice: string;
  pelangganId: string;
  namaPelanggan: string;
  namaToko: string;
  alamatPelanggan: string;
  tanggal: string;
  total: number;
  diskon: number;
  pajak: number;
  totalAkhir: number;
  status: "Lunas" | "Belum Lunas";
  metodePembayaran: "Tunai" | "Transfer";
  nomorRekening?: string;
  namaBank?: string;
  namaPemilikRekening?: string;
  pajakEnabled: boolean;
  tanggalJatuhTempo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  items?: PenjualanDetail[]; // populated from penjualan_detail
}
