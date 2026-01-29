import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { formatRupiah } from "@/helper/format";
import * as fs from "fs/promises";
import * as path from "path";
import { adminDb } from "@/lib/firebase-admin";
import { Penjualan, PenjualanDetail } from "@/app/types/penjualan";

// This function is for server-side use with admin privileges
const getAllPenjualanAdmin = async (): Promise<Penjualan[]> => {
  const q = adminDb.collection("penjualan").orderBy("createdAt", "desc");
  const snap = await q.get();

  const penjualanList: Penjualan[] = [];

  for (const docSnap of snap.docs) {
    const penjualanData = docSnap.data() as Penjualan;
    const penjualanId = docSnap.id;

    // Fetch pelanggan name
    let pelangganData = null;
    try {
      if (penjualanData.pelangganId) {
        const pelangganDoc = await adminDb
          .collection("pelanggan")
          .doc(penjualanData.pelangganId)
          .get();
        if (pelangganDoc.exists) {
          pelangganData = pelangganDoc.data();
        }
      }
    } catch (e) {
      console.error(
        `Could not fetch customer by doc ID: ${penjualanData.pelangganId}`,
        e,
      );
      // Fallback: search by idPelanggan field if doc id fails
      const pelangganQuery = adminDb
        .collection("pelanggan")
        .where("idPelanggan", "==", penjualanData.pelangganId);
      const pelangganSnap = await pelangganQuery.get();
      if (!pelangganSnap.empty) {
        pelangganData = pelangganSnap.docs[0].data();
      }
    }

    // Fetch details
    const detailQuery = adminDb
      .collection("penjualan_detail")
      .where("penjualanId", "==", penjualanId);
    const detailSnap = await detailQuery.get();
    const details: PenjualanDetail[] = [];

    for (const detailDoc of detailSnap.docs) {
      const detailData = detailDoc.data();
      const supplierProdukDoc = await adminDb
        .collection("supplier_produk")
        .doc(detailData.supplierProdukId)
        .get();
      const supplierProdukData = supplierProdukDoc.data();

      if (supplierProdukData) {
        const produkDoc = await adminDb
          .collection("produk")
          .doc(supplierProdukData.produkId)
          .get();
        const produkData = produkDoc.data();

        details.push({
          id: detailDoc.id,
          ...detailData,
          namaProduk: produkData?.nama || "Produk Tidak Ditemukan",
          satuan: produkData?.satuan || "",
          hargaJual: supplierProdukData.hargaJual || detailData.harga,
        } as PenjualanDetail);
      } else {
        details.push({
          id: detailDoc.id,
          ...detailData,
          namaProduk: "Produk Tidak Ditemukan",
          satuan: "",
          hargaJual: detailData.harga,
        } as PenjualanDetail);
      }
    }

    penjualanList.push({
      id: penjualanId,
      ...penjualanData,
      namaPelanggan: pelangganData?.namaPelanggan || "Unknown",
      alamatPelanggan: pelangganData?.alamat || "",
      items: details,
      pajak: penjualanData.pajak || 0,
    });
  }

  return penjualanList;
};

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    // Read and encode the logo first
    const logoPath = path.join(process.cwd(), "public", "logo.svg");
    const logoBuffer = await fs.readFile(logoPath);
    const logoBase64 = logoBuffer.toString("base64");
    const logoSrc = `data:image/svg+xml;base64,${logoBase64}`;

    // Fetch sales data using admin privileges
    const allSales = await getAllPenjualanAdmin();

    // Filter data based on date range
    let filteredSales = allSales;
    if (startDate) {
      filteredSales = filteredSales.filter(
        (sale) => new Date(sale.tanggal) >= new Date(startDate),
      );
    }
    if (endDate) {
      filteredSales = filteredSales.filter(
        (sale) => new Date(sale.tanggal) <= new Date(endDate),
      );
    }

    // Calculate summary
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.total,
      0,
    );
    const paidSales = filteredSales.filter(
      (sale) => sale.status === "Lunas",
    ).length;
    const unpaidSales = filteredSales.filter(
      (sale) => sale.status === "Belum Lunas",
    ).length;

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Laporan Penjualan</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              color: #1f2937;
              font-size: 11px;
              background: #fff;
            }

            .container {
              width: 100%;
              background: white;
            }

            .report-title {
              text-align: center;
              padding: 25px 30px 20px;
              background: linear-gradient(to bottom, #f8fafc, transparent);
              border-bottom: 3px solid #147146;
              margin-bottom: 25px;
            }

            .report-title h2 {
              margin: 0 0 8px 0;
              font-size: 22px;
              color: #147146;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            .report-title .period {
              display: inline-block;
              background: #147146;
              color: white;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 500;
              margin-top: 5px;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              padding: 0 30px;
              margin-bottom: 30px;
            }

            .summary-card {
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              border: 2px solid #e5e7eb;
              border-radius: 10px;
              padding: 18px 15px;
              text-align: center;
              transition: transform 0.2s;
              position: relative;
              overflow: hidden;
            }

            .summary-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #147146, #0f5a36);
            }
            .summary-card.revenue::before { background: linear-gradient(90deg, #2563eb, #1d4ed8); }
            .summary-card.paid::before { background: linear-gradient(90deg, #16a34a, #15803d); }
            .summary-card.unpaid::before { background: linear-gradient(90deg, #dc2626, #b91c1c); }

            .summary-card .icon {
              font-size: 24px;
              margin-bottom: 8px;
              opacity: 0.8;
            }

            .summary-card h3 {
              margin: 0 0 10px 0;
              font-size: 11px;
              color: #6b7280;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .summary-card p {
              margin: 0;
              font-size: 20px;
              font-weight: 700;
              color: #147146;
            }
            .summary-card.revenue p { color: #2563eb; font-size: 16px; }
            .summary-card.paid p { color: #16a34a; }
            .summary-card.unpaid p { color: #dc2626; }

            .table-container {
              padding: 0 30px 30px;
              overflow-x: auto;
            }

            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              font-size: 10px;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }

            thead tr {
              background: linear-gradient(135deg, #147146 0%, #0f5a36 100%);
              color: white;
            }

            th {
              padding: 12px 10px;
              text-align: left;
              font-weight: 600;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border: none;
            }

            td {
              padding: 10px;
              border-bottom: 1px solid #f3f4f6;
              vertical-align: top;
            }

            tbody tr {
              transition: background-color 0.2s;
            }
            tbody tr:hover { background-color: #f9fafb; }
            tbody tr:last-child td { border-bottom: none; }
            tbody tr:nth-child(even) { background-color: #fafafa; }

            .status-lunas {
              background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
              color: #065f46;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 9px;
              font-weight: 700;
              display: inline-block;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
            }

            .status-belum-lunas {
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
              color: #7f1d1d;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 9px;
              font-weight: 700;
              display: inline-block;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
            }

            .text-right { text-align: right; font-weight: 600; }
            .text-center { text-align: center; }

            .products-list {
              margin: 0;
              padding: 0;
              list-style: none;
            }

            .products-list li {
              margin-bottom: 4px;
              font-size: 9px;
              padding-left: 12px;
              position: relative;
              line-height: 1.4;
            }
            .products-list li::before {
              content: '•';
              color: #147146;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="report-title">
              <h2>Laporan Penjualan</h2>
              <span class="period">
                ${startDate && endDate ? new Date(startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) + " - " + new Date(endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : startDate ? "Dari: " + new Date(startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : endDate ? "Sampai: " + new Date(endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Semua Periode"}
              </span>
            </div>

            <div class="summary">
              <div class="summary-card">
                <div class="icon">📊</div>
                <h3>Total Penjualan</h3>
                <p>${totalSales}</p>
              </div>
              <div class="summary-card revenue">
                <div class="icon">💰</div>
                <h3>Total Pendapatan</h3>
                <p>${formatRupiah(totalRevenue)}</p>
              </div>
              <div class="summary-card paid">
                <div class="icon">✅</div>
                <h3>Penjualan Lunas</h3>
                <p>${paidSales}</p>
              </div>
              <div class="summary-card unpaid">
                <div class="icon">⏳</div>
                <h3>Belum Lunas</h3>
                <p>${unpaidSales}</p>
              </div>
            </div>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th class="text-center">No</th>
                    <th>Invoice</th>
                    <th>Surat Jalan</th>
                    <th>Tanggal</th>
                    <th>Pelanggan</th>
                    <th>Alamat</th>
                    <th>Produk Dibeli</th>
                    <th class="text-right">Total</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredSales
                    .map(
                      (sale, index) => `
                    <tr>
                      <td class="no-column">${index + 1}</td>
                      <td class="invoice-column">${sale.noInvoice}</td>
                      <td>${sale.noSuratJalan}</td>
                      <td>${new Date(sale.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td><strong>${sale.namaPelanggan || "Pelanggan Tidak Diketahui"}</strong></td>
                      <td style="font-size: 9px; color: #6b7280;">${sale.alamatPelanggan || "-"}</td>
                      <td>
                        ${
                          sale.items && sale.items.length > 0
                            ? `<ul class="products-list">${sale.items
                                .map(
                                  (item) =>
                                    `<li><strong>${item.namaProduk}</strong><br>${item.qty} ${item.satuan} × ${formatRupiah(item.hargaJual || 0)}</li>`,
                                )
                                .join("")}</ul>`
                            : "<small style='color: #9ca3af;'>Tidak ada item</small>"
                        }
                      </td>
                      <td class="text-right"><strong style="color: #147146; font-size: 11px;">${formatRupiah(sale.total)}</strong></td>
                      <td class="text-center">
                        <span class="${sale.status === "Lunas" ? "status-lunas" : "status-belum-lunas"}">
                          ${sale.status}
                        </span>
                      </td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `;

    const headerTemplate = `
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        border-bottom: 2px solid #147146;
        height: 100px;
      ">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${logoSrc}" style="height: 50px; width: 50px;" />
          <div>
            <h1 style="font-size: 18px; color: #147146; margin: 0; font-weight: 700;">Sumber Alam Pasangkayu</h1>
            <p style="margin: 3px 0 0 0; font-size: 10px; color: #6b7280;">Laporan Penjualan</p>
          </div>
        </div>
        <div style="font-size: 10px; color: #6b7280;">
          Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>
    `;

    const footerTemplate = `
      <div style="
        font-family: 'Segoe UI', sans-serif;
        width: 100%;
        text-align: center;
        padding: 0 20px;
        font-size: 9px;
        color: #6b7280;
      ">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `;

    // Launch Puppeteer and generate PDF
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("Creating new page...");
    const page = await browser.newPage();

    console.log("Setting content...");
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "120px",
        right: "20px",
        bottom: "50px",
        left: "20px",
      },
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
    });

    console.log("Closing browser...");
    await browser.close();
    console.log("PDF generated successfully");

    // Return PDF as response
    const filename =
      "laporan_penjualan_" + new Date().toISOString().split("T")[0] + ".pdf";
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=" + filename,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Gagal membuat laporan PDF", details: error.message },
      { status: 500 },
    );
  }
}
