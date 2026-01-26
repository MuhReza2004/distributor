export interface SupplierFormData {
  kode: string;
  nama: string;
  alamat: string;
  telp: string;
  status: boolean;
}

export interface Supplier extends SupplierFormData {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierProduk {
  id: string;
  supplierId: string;
  produkId: string;
  hargaBeli: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierProdukFormData {
  supplierId: string;
  produkId: string;
  hargaBeli: number;
}
