"use client";

import { Pembelian } from "@/app/types/pembelian";
import { formatRupiah } from "@/helper/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PembelianTable({ data }: { data: Pembelian[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>NPB</TableHead>
          <TableHead>DO</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((p) => (
          <TableRow key={p.id}>
            <TableCell>{p.npb}</TableCell>
            <TableCell>{p.nomorDO}</TableCell>
            <TableCell>{p.supplierNama}</TableCell>
            <TableCell>{new Date(p.tanggal).toLocaleDateString()}</TableCell>
            <TableCell>{formatRupiah(p.total)}</TableCell>{" "}
            {/* Diubah: Gunakan formatRupiah */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
