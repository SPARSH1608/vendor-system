"use client"

import { useEffect, useState } from "react"
import { invoicesAPI } from "../services/api"
import { Eye } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable";
import { useTranslation } from "react-i18next";

const InvoiceList = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)
      try {
        const res = await invoicesAPI.getInvoices()
        setInvoices(res.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const handlePreview = (invoice: any) => {
    setSelectedInvoice(invoice)
    setNewStatus(invoice.status || "draft")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedInvoice(null)
  }

  const handleStatusUpdate = async () => {
    if (!selectedInvoice?._id || !newStatus) return
    setStatusUpdating(true)
    try {
      const updated = await invoicesAPI.updateInvoiceStatus(selectedInvoice._id, newStatus)
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === selectedInvoice._id ? { ...inv, status: updated.data.status } : inv
        )
      )
      setSelectedInvoice((prev: any) => ({ ...prev, status: updated.data.status }))
    } catch (err: any) {
      alert(err.message || t("failedToUpdateStatus"))
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!selectedInvoice) return;

    try {
      const doc = new jsPDF();

      // Add Invoice Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(t("invoiceTitle"), 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${t("invoiceNumber")}: ${selectedInvoice.invoiceNumber || selectedInvoice._id}`, 14, 40);
      doc.text(`${t("vendor")}: ${selectedInvoice.vendor_id?.name || t("notAvailable")}`, 14, 50);
      doc.text(
        `${t("dateRange")}: ${selectedInvoice.dateRange?.start?.slice(0, 10)} ${t("to")} ${selectedInvoice.dateRange?.end?.slice(0, 10)}`,
        14,
        60
      );
      doc.text(`${t("status")}: ${selectedInvoice.status || t("draft")}`, 14, 70);

      // Add Table for Items
      const tableData = selectedInvoice.items.map((item: any) => [
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
      doc.text(`${t("total")}: ${t("currency")} ${selectedInvoice.totalAmount.toFixed(2)}`, 14, finalY + 20);

      // Save the PDF
      doc.save(`invoice-${selectedInvoice.invoiceNumber || selectedInvoice._id}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert(t("pdfGenerationFailed"));
    }
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("invoiceListTitle")}</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("invoiceListDesc")}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="text-gray-500 text-center py-8">{t("noInvoicesFound")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("invoiceNumberShort")}</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("vendor")}</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("dateRange")}</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("total")}</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">{t("status")}</th>
                  <th className="px-2 sm:px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-2 sm:px-4 py-3 text-gray-900 font-mono">{invoice.invoiceNumber}</td>
                    <td className="px-2 sm:px-4 py-3 text-gray-900">
                      {invoice.vendor_id?.name || "-"}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-gray-900">
                      {invoice.dateRange?.start?.slice(0, 10)} {t("to")} {invoice.dateRange?.end?.slice(0, 10)}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-gray-900 font-semibold">{t("currency")}{invoice.totalAmount}</td>
                    <td className="px-2 sm:px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : invoice.status === "sent"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t(invoice.status || "generated")}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <button
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                        onClick={() => handlePreview(invoice)}
                        title={t("preview")}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Invoice Preview */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl p-0 relative border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 rounded-t-2xl bg-gray-50">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{t("invoicePreview")}</h2>
                <div className="text-gray-500 text-xs sm:text-sm">
                  {t("invoiceNumberShort")}: <span className="font-mono">{selectedInvoice.invoiceNumber}</span>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-red-500 transition-colors text-2xl font-bold"
                onClick={closeModal}
                aria-label={t("close")}
              >
                ×
              </button>
            </div>

            <div className="px-4 sm:px-8 py-4 sm:py-6">
              {/* Invoice Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">{t("vendor")}:</span>{" "}
                    <span className="text-gray-900">{selectedInvoice.vendor_id?.email || "-"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">{t("dateRange")}:</span>{" "}
                    <span className="text-gray-900">
                      {selectedInvoice.dateRange?.start?.slice(0, 10)} {t("to")} {selectedInvoice.dateRange?.end?.slice(0, 10)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">{t("status")}:</span>{" "}
                    <span className="text-gray-900">{t(selectedInvoice.status || "generated")}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col justify-center">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">{t("subtotal")}:</span>
                    <span className="font-medium text-gray-900">{t("currency")}{selectedInvoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">{t("tax")}: ({selectedInvoice.taxRate || 10}%)</span>
                    <span className="font-medium text-gray-900">{t("currency")}{selectedInvoice.tax}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                    <span>{t("total")}:</span>
                    <span>{t("currency")}{selectedInvoice.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("changeStatus")}</label>
                <div className="flex items-center gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    disabled={statusUpdating}
                  >
                    <option value="draft">{t("draft")}</option>
                    <option value="sent">{t("sent")}</option>
                    <option value="paid">{t("paid")}</option>
                    <option value="overdue">{t("overdue")}</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={statusUpdating || newStatus === (selectedInvoice.status || "draft")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {statusUpdating ? t("updating") : t("update")}
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">{t("items")}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm mb-4 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-2 px-2 sm:px-3">{t("product")}</th>
                        <th className="text-left py-2 px-2 sm:px-3">{t("qty")}</th>
                        <th className="text-left py-2 px-2 sm:px-3">{t("price")}</th>
                        <th className="text-left py-2 px-2 sm:px-3">{t("total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="py-2 px-2 sm:px-3">{item.productName}</td>
                          <td className="py-2 px-2 sm:px-3">{item.quantity}</td>
                          <td className="py-2 px-2 sm:px-3">{t("currency")}{item.price}</td>
                          <td className="py-2 px-2 sm:px-3">{t("currency")}{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* QR and Download */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-6 mt-6">
                {selectedInvoice.qrCode && (
                  <div className="flex flex-col items-center">
                    <span className="mb-1 text-xs text-gray-500">{t("qrCode")}</span>
                    <img src={selectedInvoice.qrCode} alt="QR Code" className="w-20 h-20 border rounded" />
                  </div>
                )}
                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("downloadPDF")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceList