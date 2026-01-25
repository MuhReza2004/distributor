import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import {
  Supplier,
  SupplierFormData,
  SupplierProduct,
} from "@/app/types/suplyer";

/* ======================
   CREATE
====================== */
export const addSupplier = async (data: SupplierFormData): Promise<string> => {
  const ref = await addDoc(collection(db, "suppliers"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
};

/* ======================
   READ
====================== */
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  const snap = await getDocs(collection(db, "suppliers"));

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as SupplierFormData),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  }));
};

export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  const snap = await getDoc(doc(db, "suppliers", id));
  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as SupplierFormData),
    createdAt: snap.data().createdAt?.toDate(),
    updatedAt: snap.data().updatedAt?.toDate(),
  };
};

/* ======================
   UPDATE
====================== */
export const updateSupplier = async (
  id: string,
  data: Partial<SupplierFormData>,
): Promise<void> => {
  await updateDoc(doc(db, "suppliers", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const addProductToSupplier = async (
  supplierId: string,
  product: SupplierProduct,
): Promise<void> => {
  const supplierRef = doc(db, "suppliers", supplierId);
  await updateDoc(supplierRef, {
    products: arrayUnion(product),
  });
};

/* ======================
   DELETE
====================== */
export const deleteSupplier = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "suppliers", id));
};
