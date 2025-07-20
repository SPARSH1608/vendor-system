const puppeteer = require("puppeteer")
const moment = require("moment")

const generatePDF = async (invoice) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
          }
          .company-info h1 {
            color: #007bff;
            margin: 0;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .vendor-info, .invoice-meta {
            flex: 1;
          }
          .invoice-meta {
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .text-right {
            text-align: right;
          }
          .total-section {
            margin-left: auto;
            width: 300px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .total-row.final {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 1.2em;
          }
          .qr-section {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>Vendor Management System</h1>
            <p>Professional Invoice</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>${invoice.invoiceNumber}</strong></p>
          </div>
        </div>

        <div class="invoice-details">
          <div class="vendor-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.vendor_id?.email || "Multiple Vendors"}</strong></p>
            ${invoice.vendor_id?.phone ? `<p>Phone: ${invoice.vendor_id.phone}</p>` : ""}
          </div>
          <div class="invoice-meta">
            <p><strong>Invoice Date:</strong> ${moment(invoice.createdAt).format("MMMM DD, YYYY")}</p>
            <p><strong>Period:</strong> ${moment(invoice.dateRange.start).format("MMM DD, YYYY")} - ${moment(invoice.dateRange.end).format("MMM DD, YYYY")}</p>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>${item.productName}</td>
                <td class="text-right">${item.quantity} kg</td>
                <td class="text-right">₹${item.price.toFixed(2)}</td>
                <td class="text-right">₹${item.total.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (${invoice.taxRate}%):</span>
            <span>₹${invoice.tax.toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Total:</span>
            <span>₹${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        ${
          invoice.qrCode
            ? `
          <div class="qr-section">
            <h3>Payment QR Code</h3>
            <img src="${invoice.qrCode}" alt="Payment QR Code" style="max-width: 200px;">
            <p>Scan to make payment</p>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${moment().format("MMMM DD, YYYY [at] HH:mm")}</p>
        </div>
      </body>
      </html>
    `

    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    })

    await browser.close()

    return pdfBuffer
  } catch (error) {
    console.error("PDF generation error:", error)
    throw new Error("Failed to generate PDF")
  }
}

const generateUserManagementPDF = async (vendors) => {
  const doc = new PDFDocument();

  // Example: Fix UI and include vendor name
  vendors.forEach((vendor) => {
    doc.text(`Vendor Name: ${vendor.name}`, { align: 'left' });
    doc.text(`Phone: ${vendor.phone}`, { align: 'left' });
    doc.moveDown();
  });

  // ...existing PDF generation logic...
};

module.exports = {
  generatePDF,
  generateUserManagementPDF,
};
