import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Produk, ProdukFormData } from "../types/produk";

/* =============================
   AUTO GENERATE KODE PRODUK
   ============================= */
const generateProdukCode = async (): Promise<string> => {
  const counterRef = doc(db, "counters", "produk");

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

  return `BRG-${String(next).padStart(3, "0")}`;
};

/* =============================
   CREATE
   ============================= */
export const addProduk = async (data: ProdukFormData): Promise<string> => {
  const code = await generateProdukCode();

  const ref = await addDoc(collection(db, "produk"), {
    ...data,
    code,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
};

/* =============================
   READ
   ============================= */
export const getAllProduk = async (): Promise<Produk[]> => {
  const q = query(collection(db, "produk"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate(),
    updatedAt: d.data().updatedAt?.toDate(),
  })) as Produk[];
};

export const getProdukById = async (id: string): Promise<Produk | null> => {
  const snap = await getDoc(doc(db, "produk", id));
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate(),
    updatedAt: snap.data().updatedAt?.toDate(),
  } as Produk;
};

/* =============================
   UPDATE & DELETE
   ============================= */
export const updateProduk = async (
  id: string,
  data: ProdukFormData,
): Promise<void> => {
  await updateDoc(doc(db, "produk", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduk = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "produk", id));
};
