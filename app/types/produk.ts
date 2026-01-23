export interface ProdukFormData {
  supplyerName: string; // Nama supplyer
  dateReceived: string; // Tanggal diterima
  contractNumber: string; // Nomor kontrak
  invoiceNumber: string; // Nomor faktur
  warehouseOrigin: string; // Asal gudang
  npb: string; // NPB
  name: string; // Nama produk
  unit: string; // Satuan (dus, pcs, kg, liter)
  buyPrice: number; // Harga beli
  sellPrice: number; // Harga jual
  stock: number; // Jumlah / stok
}

export interface Produk extends ProdukFormData {
  id: string;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
}
