import {
  addDoc,
  collection,
  updateDoc,
  doc,
  increment,
  getDocs,
  orderBy,
  query,
  runTransaction,
} from "firebase/firestore";
import { Penjualan } from "@/app/types/penjualan";
import { db } from "../lib/firebase";
import { Produk } from "../types/produk";

export const createPenjualan = async (data: Penjualan) => {
  // Use a transaction to ensure stock validation and updates are atomic
  await runTransaction(db, async (transaction) => {
    // 1. Validate stock for all items
    for (const item of data.items) {
      const produkRef = doc(db, "produk", item.produkId);
      const produkDoc = await transaction.get(produkRef);

      if (!produkDoc.exists()) {
        throw new Error(`Produk ${item.namaProduk} tidak ditemukan.`);
      }

      const currentStok = produkDoc.data().stok;
      if (currentStok < item.qty) {
        throw new Error(
          `Stok produk ${item.namaProduk} tidak mencukupi. Sisa stok: ${currentStok}`,
        );
      }
    }

    // 2. If all validations pass, create the sale and update stock
    const penjualanRef = doc(collection(db, "penjualan")); // Create a new doc ref
    transaction.set(penjualanRef, { ...data, createdAt: new Date() });

    for (const item of data.items) {
      const produkRef = doc(db, "produk", item.produkId);
      transaction.update(produkRef, {
        stok: increment(-item.qty),
      });
    }
  });
};

export const getAllPenjualan = async (): Promise<Penjualan[]> => {
  const q = query(collection(db, "penjualan"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Penjualan[];
};

export const updatePenjualanStatus = async (
  id: string,
  status: "Lunas" | "Belum Lunas",
): Promise<void> => {
  const penjualanRef = doc(db, "penjualan", id);
  await updateDoc(penjualanRef, { status });
};

export const generateInvoiceNumber = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "penjualan");

  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);

    if (!snap.exists()) {
      tx.set(counterRef, { lastNumber: 1 });
      return 1;
    }

    const nextNumber = snap.data().lastNumber + 1;
    tx.update(counterRef, { lastNumber: nextNumber });
    return nextNumber;
  });

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `INV/${year}${month}${day}/${String(next).padStart(4, "0")}`;
};
