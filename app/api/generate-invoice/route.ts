import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { Penjualan } from "@/app/types/penjualan";

function numberToWords(num: number): string {
  const units = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
  ];
  const teens = [
    "sepuluh",
    "sebelas",
    "dua belas",
    "tiga belas",
    "empat belas",
    "lima belas",
    "enam belas",
    "tujuh belas",
    "delapan belas",
    "sembilan belas",
  ];
  const tens = [
    "",
    "",
    "dua puluh",
    "tiga puluh",
    "empat puluh",
    "lima puluh",
    "enam puluh",
    "tujuh puluh",
    "delapan puluh",
    "sembilan puluh",
  ];
  const thousands = ["", "ribu", "juta", "miliar", "triliun"];

  if (num === 0) return "nol";

  function convertHundreds(n: number): string {
    let str = "";
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h > 0) {
      if (h === 1) str += "seratus ";
      else str += units[h] + " ratus ";
    }

    if (t > 0) {
      if (t === 1) {
        str += teens[u] + " ";
        return str.trim();
      } else {
        str += tens[t] + " ";
      }
    }

    if (u > 0) {
      str += units[u] + " ";
    }

    return str.trim();
  }

  let result = "";
  let tempNum = num;
  let thousandIndex = 0;

  while (tempNum > 0) {
    const chunk = tempNum % 1000;
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      if (thousandIndex === 1 && chunk === 1) {
        result = "seribu " + result;
      } else if (chunkWords) {
        result = chunkWords + " " + thousands[thousandIndex] + " " + result;
      }
    }
    tempNum = Math.floor(tempNum / 1000);
    thousandIndex++;
  }

  return result.trim() + " rupiah";
}

async function generatePdf(penjualan: Penjualan): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${penjualan.nomorInvoice}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 40px;
      color: #333;
      font-size: 12px;
    }

    .row {
      display: flex;
      justify-content: space-between;
    }

    .header {
      margin-bottom: 30px;
    }

    .company h2 {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
    }

    .company p {
      margin: 2px 0;
      font-size: 11px;
    }

    .invoice-box {
      text-align: right;
    }

    .invoice-box h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 2px;
    }

    .invoice-box p {
      margin: 4px 0;
      font-size: 11px;
    }

    .divider {
      border-top: 2px solid #000;
      margin: 20px 0;
    }

    .customer {
      margin-bottom: 20px;
    }

    .customer strong {
      display: inline-block;
      width: 120px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    thead {
      background: #f2f2f2;
    }

    th {
      text-align: left;
      padding: 8px;
      border-bottom: 2px solid #000;
      font-size: 12px;
    }

    td {
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .summary {
      width: 40%;
      margin-left: auto;
      margin-top: 20px;
    }

    .summary table {
      width: 100%;
    }

    .summary td {
      padding: 6px;
      border: none;
    }

    .summary tr:last-child td {
      border-top: 2px solid #000;
      font-weight: bold;
      font-size: 14px;
    }

    .total-highlight {
      font-size: 28px;
      font-weight: bold;
      text-align: right;
      margin-top: 10px;
    }

    .footer {
      margin-top: 40px;
      font-size: 11px;
    }

    .sign {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      text-align: center;
    }
  </style>
</head>

<body>

  <!-- HEADER -->
  <div class="row header">
    <div class="company">
      <h2>PT.SUMBER ALAM PASANGKAYU</h2>
      <p>Jl. Soekarno Hatta Pasangkayu</p>
      <p>Telp/HP: 0821-9030-9333</p>
      <p>Email: sumberalampasangkayu@gmail.com</p>
    </div>

    <div class="invoice-box">
      <h1>INVOICE</h1>
      <p>No Invoice: ${penjualan.nomorInvoice}</p>
      <p>Tanggal: ${new Date(penjualan.tanggal).toLocaleDateString("id-ID")}</p>
      <p>Pembayaran: ${penjualan.metodePembayaran}</p>
      ${penjualan.metodePembayaran === "Transfer" ? `<p>Bank: ${penjualan.namaBank}</p><p>Pemilik Rekening: ${penjualan.namaPemilikRekening}</p>` : ""} ${penjualan.nomorRekening ? `<p>Rekening: ${penjualan.nomorRekening}</p>` : ""}
    </div>
  </div>

  <div class="divider"></div>

  <!-- CUSTOMER -->
  <div class="customer">
    <p><strong>Kepada Yth</strong></p>
    <p><strong>Nama</strong>: ${penjualan.namaPelanggan}</p>
    <p><strong>Toko</strong>: ${penjualan.namaToko}</p>
    <p><strong>Status</strong>: ${penjualan.status}</p>
  </div>

  <!-- TABLE -->
  <table>
    <thead>
      <tr>
        <th class="text-center">No</th>
        <th>Nama Produk</th>
        <th class="text-center">Qty</th>
        <th class="text-center">Satuan</th>
        <th class="text-right">Harga</th>
        <th class="text-right">Jumlah</th>
      </tr>
    </thead>
    <tbody>
      ${penjualan.items
        .map(
          (item, i) => `
        <tr>
          <td class="text-center">${i + 1}</td>
          <td>${item.namaProduk}</td>
          <td class="text-center">${item.qty}</td>
          <td class="text-center">${item.satuan}</td>
          <td class="text-right">Rp ${item.hargaJual.toLocaleString("id-ID")}</td>
          <td class="text-right">Rp ${item.subtotal.toLocaleString("id-ID")}</td>
        </tr>
      `,
        )
        .join("")}

    </tbody>
  </table>

  <!-- TERBILANG -->
  <div style="margin-top: 20px;font-size: 14px;">
    <p><strong>Terbilang:</strong> ${numberToWords(Math.floor(penjualan.totalAkhir))} rupiah</p>
  </div>

  <!-- SUMMARY -->
  <div class="summary">
    <table>
      <tr>
        <td>Subtotal</td>
        <td class="text-right">Rp ${penjualan.total.toLocaleString("id-ID")}</td>
      </tr>
      ${
        penjualan.diskon > 0
          ? `<tr>
        <td>Diskon</td>
        <td class="text-right">-Rp ${penjualan.diskon.toLocaleString("id-ID")}</td>
      </tr>`
          : ""
      }
      ${
        penjualan.pajakEnabled && penjualan.pajak > 0
          ? `<tr>
        <td>PPN 11%</td>
        <td class="text-right">Rp ${penjualan.pajak.toLocaleString("id-ID")}</td>
      </tr>`
          : ""
      }
      <tr>
        <td>Total Akhir</td>
        <td class="text-right">Rp ${penjualan.totalAkhir.toLocaleString("id-ID")}</td>
      </tr>
    </table>
  </div>

  <div class="total-highlight">
    Rp ${penjualan.totalAkhir.toLocaleString("id-ID")}
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>Terima kasih atas kepercayaan Anda.</p>
  </div>

  <div class="sign">
    <div>
      Hormat Kami,<br /><br /><br />
      ( Pimpinan PT.SUMBER ALAM PASANGKAYU )
    </div>
    <div>
      Diterima Oleh,<br /><br /><br />
      ( _____________ )
    </div>
  </div>

</body>
</html>
`;

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "50px",
      right: "50px",
      bottom: "50px",
      left: "50px",
    },
  });

  await browser.close();

  return pdfBuffer;
}

export async function POST(request: NextRequest) {
  try {
    const penjualan: Penjualan = await request.json();
    console.log("Received penjualan data:", JSON.stringify(penjualan, null, 2));

    // Validate required fields
    if (
      !penjualan.nomorInvoice ||
      !penjualan.namaPelanggan ||
      !penjualan.items ||
      penjualan.items.length === 0
    ) {
      throw new Error(
        "Missing required fields: nomorInvoice, namaPelanggan, or items",
      );
    }

    // Validate items
    for (const item of penjualan.items) {
      if (
        !item.namaProduk ||
        typeof item.qty !== "number" ||
        typeof item.hargaJual !== "number"
      ) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
    }

    const pdfData = await generatePdf(penjualan);

    return new NextResponse(pdfData as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${penjualan.nomorInvoice}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 },
    );
  }
}
