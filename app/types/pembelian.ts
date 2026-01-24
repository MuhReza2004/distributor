export interface PembelianItem {
  produkId: string;
  namaProduk: string;
  hargaBeli: number;
  qty: number;
  subtotal: number;
}

export interface Pembelian {
  id?: string;
  npb: string;
  nomorDO: string;
  supplierId: string;
  supplierNama: string;
  tanggal: string;
  items: PembelianItem[];
  total: number;
  status: string;
  createdAt: Date;
}
