"use client"

import { useState, useEffect } from "react"
import { FileText, Download } from "lucide-react"
import { invoicesAPI, usersAPI } from "../services/api"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

const InvoiceGenerator = () => {
  const { t } = useTranslation();
  const [invoiceOptions, setInvoiceOptions] = useState({
    type: "All Vendors",
    startDate: "",
    endDate: "",
  })
  const [vendors, setVendors] = useState<{ _id: string; name: string; email: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    usersAPI.getUsers({ role: "vendor" }).then((res) => {
      setVendors(res.data)
    })
  }, [])

  const handleGenerateInvoice = async () => {
    setLoading(true)
    setError(null)
    setInvoice(null)
    try {
      const type =
        invoiceOptions.type === "All Vendors" ? "multiple" : "single"
      const vendorId =
        invoiceOptions.type === "All Vendors" ? undefined : invoiceOptions.type
      const res = await invoicesAPI.generateInvoice({
        vendorId,
        startDate: invoiceOptions.startDate,
        endDate: invoiceOptions.endDate,
        type,
      })
      setInvoice(res.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!invoice) return;

    try {
      const doc = new jsPDF();

      // Add Invoice Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(t("invoiceTitle"), 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${t("invoiceNumber")}: ${invoice.invoiceNumber || invoice._id}`, 14, 40);
      doc.text(`${t("vendor")}: ${invoice.vendorEmail || t("multipleVendors")}`, 14, 50);
      doc.text(
        `${t("dateRange")}: ${invoice.dateRange?.start?.slice(0, 10)} ${t("to")} ${invoice.dateRange?.end?.slice(0, 10)}`,
        14,
        60
      );
      doc.text(`${t("status")}: ${invoice.status || t("draft")}`, 14, 70);

      // Add Table for Items
      const tableData = invoice.items.map((item: any) => [
        item.productName,
        item.quantity.toFixed(2),
        `${t("currency")} ${item.price.toFixed(2)}`,
        `${t("currency")} ${item.total.toFixed(2)}`,
      ]);

      autoTable(doc, {
        head: [[t("product"), t("quantity"), t("price"), t("total")]],
        body: tableData,
        startY: 80,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [245, 245, 245],
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },
      });

      // Add Invoice Totals
      const finalY = (doc as any).lastAutoTable?.finalY || 80;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`${t("total")}: ${t("currency")} ${invoice.totalAmount.toFixed(2)}`, 14, finalY + 20);

      // Save the PDF
      doc.save(`invoice-${invoice.invoiceNumber || invoice._id}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert(t("pdfGenerationFailed"));
    }
  };

  const displayInvoice = invoice

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("invoiceGenerator")}</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("generateInvoicesDesc")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">{t("invoiceOptions")}</h2>
          </div>
          <p className="text-gray-600 text-sm mb-6">{t("configureInvoiceParams")}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("invoiceType")}</label>
              <select
                value={invoiceOptions.type}
                onChange={(e) => setInvoiceOptions({ ...invoiceOptions, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Vendors">{t("allVendors")}</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name || v.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("startDate")}</label>
              <input
                type="date"
                value={invoiceOptions.startDate}
                onChange={(e) => setInvoiceOptions({ ...invoiceOptions, startDate: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("endDate")}</label>
              <input
                type="date"
                value={invoiceOptions.endDate}
                onChange={(e) => setInvoiceOptions({ ...invoiceOptions, endDate: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleGenerateInvoice}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? t("generating") : t("generateInvoice")}
            </button>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t("invoicePreview")}</h2>
          <p className="text-gray-600 text-sm mb-6">{t("generatedInvoiceWillAppear")}</p>

          {displayInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{t("invoiceTitle")}</h3>
                  <p className="text-gray-600">#{displayInvoice._id || displayInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <p className="font-medium text-gray-900">
                    {t("vendor")}: {displayInvoice.vendorEmail || t("multipleVendors")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t("period")}: {displayInvoice.dateRange?.start?.slice(0, 10)} {t("to")} {displayInvoice.dateRange?.end?.slice(0, 10)}
                  </p>
                  <p className="text-sm text-gray-600">{t("location")}: {displayInvoice.location || t("multipleLocations")}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm mb-4 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 text-left">{t("product")}</th>
                      <th className="px-2 sm:px-4 py-2 text-left">{t("quantity")}</th>
                      <th className="px-2 sm:px-4 py-2 text-left">{t("price")}</th>
                      <th className="px-2 sm:px-4 py-2 text-left">{t("total")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayInvoice.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-2 sm:px-4 py-2">{item.productName}</td>
                        <td className="px-2 sm:px-4 py-2">{item.quantity} {t("kg")}</td>
                        <td className="px-2 sm:px-4 py-2">{t("currency")}{item.price}</td>
                        <td className="px-2 sm:px-4 py-2">{t("currency")}{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Total */}
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("subtotal")}:</span>
                  <span className="font-medium">{t("currency")}{displayInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t("total")}:</span>
                  <span>{t("currency")}{displayInvoice.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  onClick={handleDownloadPDF}
                  disabled={!invoice}
                >
                  <Download className="w-4 h-4" />
                  <span>{t("downloadPDF")}</span>
                </button>
                {invoice.qrCode && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="mb-1 text-xs text-gray-500">{t("qrCode")}</span>
                    <img src={invoice.qrCode} alt="QR Code" className="w-20 h-20" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceGenerator
