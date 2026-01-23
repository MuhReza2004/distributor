import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const snap = await adminDb.collection("orders").get();

  const data = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { items, userId, buyerName } = await req.json();

  let total = 0;
  items.forEach((i: any) => (total += i.subtotal));

  await adminDb.collection("orders").add({
    buyerName,
    items,
    total,
    status: "Diproses",
    createdBy: userId,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
