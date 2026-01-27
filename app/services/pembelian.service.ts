import {
  addDoc,
  collection,
  updateDoc,
  doc,
  increment,
  getDocs,
  orderBy,
  query,
  getDoc,
  where,
} from "firebase/firestore";
import { Pembelian, PembelianDetail } from "../types/pembelian";
import { db } from "../lib/firebase";

export const createPembelian = async (data: {
  supplierId: string;
  tanggal: string;
  noDO?: string;
  noNPB?: string;
  invoice?: string;
  total: number;
  status: string;
  items: PembelianDetail[];
}) => {
  const pembelianRef = await addDoc(collection(db, "pembelian"), {
    supplierId: data.supplierId,
    tanggal: data.tanggal,
    noDO: data.noDO,
    noNPB: data.noNPB,
    invoice: data.invoice,
    total: data.total,
    status: data.status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create pembelian_detail documents
  for (const item of data.items) {
    await addDoc(collection(db, "pembelian_detail"), {
      pembelianId: pembelianRef.id,
      supplierProdukId: item.supplierProdukId,
      qty: item.qty,
      harga: item.harga,
      subtotal: item.subtotal,
    });

    // Update stock
    const supplierProdukRef = doc(db, "supplier_produk", item.supplierProdukId);
    await updateDoc(supplierProdukRef, {
      stok: increment(item.qty),
    });
  }

  return pembelianRef.id;
};

export const getAllPembelian = async (): Promise<Pembelian[]> => {
  const q = query(collection(db, "pembelian"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  const pembelianList: Pembelian[] = [];

  for (const docSnap of snap.docs) {
    const pembelianData = docSnap.data() as Pembelian;
    const pembelianId = docSnap.id;

    // Fetch details
    const detailQuery = query(
      collection(db, "pembelian_detail"),
      orderBy("supplierProdukId"),
    );
    const detailSnap = await getDocs(detailQuery);
    const details = detailSnap.docs
      .filter((d) => d.data().pembelianId === pembelianId)
      .map((d) => ({
        id: d.id,
        ...d.data(),
      })) as PembelianDetail[];

    pembelianList.push({
      id: pembelianId,
      ...pembelianData,
      items: details, // Add items for compatibility
    });
  }

  return pembelianList;
};

export const getPembelianDetails = async (
  pembelianId: string,
): Promise<PembelianDetail[]> => {
  const q = query(
    collection(db, "pembelian_detail"),
    where("pembelianId", "==", pembelianId),
  );
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PembelianDetail[];
};
