import {
  addDoc,
  collection,
  updateDoc,
  doc,
  increment,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { Pembelian } from "@/app/types/pembelian";
import { db } from "../lib/firebase";

export const createPembelian = async (data: Pembelian) => {
  const ref = await addDoc(collection(db, "pembelian"), {
    ...data,
    createdAt: new Date(),
  });

  // stok masuk
  for (const item of data.items) {
    const produkRef = doc(db, "produk", item.produkId);
    await updateDoc(produkRef, {
      stok: increment(item.qty),
    });
  }

  return ref.id;
};

export const getAllPembelian = async () => {
  const q = query(collection(db, "pembelian"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Pembelian[];
};
