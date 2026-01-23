import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const doc = await adminDb.collection("orders").doc(params.id).get();

  if (!doc.exists)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { items } = await req.json();

  await adminDb.collection("orders").doc(params.id).update({
    items,
    updatedAt: new Date(),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  await adminDb.collection("orders").doc(params.id).delete();
  return NextResponse.json({ success: true });
}
