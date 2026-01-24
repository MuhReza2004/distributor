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
  tanggal: string;
  items: PenjualanItem[];
  total: number;
  status: "Lunas" | "Belum Lunas";
  metodePembayaran: "Tunai" | "Transfer";
  createdAt: Date;
}
