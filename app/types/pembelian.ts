export interface PembelianDetail {
  id?: string;
  pembelianId?: string;
  produkId: string;
  qty: number;
  harga: number;
  subtotal: number;
}

export interface Pembelian {
  id?: string;
  supplierId: string;
  tanggal: string;
  noDO?: string;
  noNPB?: string;
  invoice?: string;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
  items?: PembelianDetail[]; // populated from pembelian_detail
}
