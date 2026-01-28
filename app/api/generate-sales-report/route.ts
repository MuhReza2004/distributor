import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getAllPenjualan } from "@/app/services/penjualan.service";
import { formatRupiah } from "@/helper/format";

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();

    // Fetch sales data
    const allSales = await getAllPenjualan();

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
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #2563eb;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              background: #f9f9f9;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #666;
            }
            .summary-card p {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .paid { color: #16a34a; }
            .unpaid { color: #dc2626; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .status-lunas {
              background-color: #dcfce7;
              color: #166534;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
            }
            .status-belum-lunas {
              background-color: #fef2f2;
              color: #991b1b;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .products-list {
              margin: 0;
              padding-left: 15px;
            }
            .products-list li {
              margin-bottom: 2px;
              font-size: 11px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Penjualan</h1>
            <p>Periode: ${startDate ? new Date(startDate).toLocaleDateString("id-ID") : "Semua"} - ${endDate ? new Date(endDate).toLocaleDateString("id-ID") : "Semua"}</p>
            <p>Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
          </div>

          <div class="summary">
            <div class="summary-card">
              <h3>Total Penjualan</h3>
              <p>${totalSales}</p>
            </div>
            <div class="summary-card">
              <h3>Total Pendapatan</h3>
              <p>${formatRupiah(totalRevenue)}</p>
            </div>
            <div class="summary-card">
              <h3>Penjualan Lunas</h3>
              <p class="paid">${paidSales}</p>
            </div>
            <div class="summary-card">
              <h3>Belum Lunas</h3>
              <p class="unpaid">${unpaidSales}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>No Invoice</th>
                <th>No Surat Jalan</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Produk Dibeli</th>
                <th class="text-right">Total</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSales
                .map(
                  (sale) => `
                <tr>
                  <td>${sale.noInvoice}</td>
                  <td>${sale.noSuratJalan}</td>
                  <td>${new Date(sale.tanggal).toLocaleDateString("id-ID")}</td>
                  <td>
                    <strong>${sale.namaPelanggan || "Pelanggan Tidak Diketahui"}</strong>
                    ${sale.alamatPelanggan ? `<br><small>${sale.alamatPelanggan}</small>` : ""}
                  </td>
                  <td>
                    ${
                      sale.items && sale.items.length > 0
                        ? `<ul class="products-list">${sale.items
                            .map(
                              (item) =>
                                `<li>${item.namaProduk} (${item.qty} x ${formatRupiah(item.hargaJual || 0)})</li>`,
                            )
                            .join("")}</ul>`
                        : "<small>Tidak ada item</small>"
                    }
                  </td>
                  <td class="text-right"><strong>${formatRupiah(sale.total)}</strong></td>
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

          <div class="footer">
            <p>Laporan ini dihasilkan secara otomatis oleh sistem Gudang Sumber Alam Pasangkayu</p>
          </div>
        </body>
      </html>
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
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    console.log("Closing browser...");
    await browser.close();
    console.log("PDF generated successfully");

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=laporan_penjualan_${new Date().toISOString().split("T")[0]}.pdf`,
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
