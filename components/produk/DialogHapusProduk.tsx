// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { deleteProduk } from "@/app/services/produk.service";
// import { Produk } from "@/app/types/produk";
// import { Trash2 } from "lucide-react";

// interface DialogHapusProdukProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   produk: Produk | null;
//   onSuccess?: () => void;
// }

// export default function DialogHapusProduk({
//   open,
//   onOpenChange,
//   produk,
//   onSuccess,
// }: DialogHapusProdukProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleDelete = async () => {
//     if (!produk) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       await deleteProduk(produk.id);

//       // Callback untuk refresh tabel
//       if (onSuccess) {
//         onSuccess();
//       }

//       onOpenChange(false);
//     } catch (err: any) {
//       console.error("Error deleting produk:", err);
//       setError(err?.message || "Gagal menghapus produk");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleClose = () => {
//     if (!isLoading) {
//       setError(null);
//       onOpenChange(false);
//     }
//   };

//   if (!produk) return null;

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-red-100 rounded-full">
//               <Trash2 className="size-5 text-red-600" />
//             </div>
//             <div>
//               <DialogTitle>Hapus Produk</DialogTitle>
//               <DialogDescription className="mt-1">
//                 Tindakan ini tidak dapat dibatalkan
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="py-4">
//           <p className="text-sm text-muted-foreground mb-2">
//             Apakah Anda yakin ingin menghapus produk berikut?
//           </p>
//           <div className="bg-muted p-3 rounded-md">
//             <p className="font-semibold">{produk.name}</p>
//             <p className="text-sm text-muted-foreground">Kode: {produk.code}</p>
//           </div>
//         </div>

//         {error && (
//           <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200 text-sm">
//             {error}
//           </div>
//         )}

//         <DialogFooter>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={handleClose}
//             disabled={isLoading}
//           >
//             Batal
//           </Button>
//           <Button
//             type="button"
//             variant="destructive"
//             onClick={handleDelete}
//             disabled={isLoading}
//           >
//             {isLoading ? "Menghapus..." : "Hapus"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
