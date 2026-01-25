export interface PenjualanItem {
  produkId: string;
  namaProduk: string;
  satuan: string;
  hargaJual: number;
  qty: number;
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
  items: PenjualanItem[];
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
  createdAt: Date;
}
