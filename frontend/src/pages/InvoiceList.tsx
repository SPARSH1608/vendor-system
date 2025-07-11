"use client"

import { useEffect, useState } from "react"
import { invoicesAPI } from "../services/api"
import { Eye } from "lucide-react"

const InvoiceList = () => {
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
      alert(err.message || "Failed to update status")
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Invoices</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">View and manage all generated invoices</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">Date Range</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-2 sm:px-4 py-3 text-left font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-2 sm:px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-2 sm:px-4 py-3 text-gray-900 font-mono">{invoice.invoiceNumber}</td>
                    <td className="px-2 sm:px-4 py-3 text-gray-900">
                      {invoice.vendor_id?.email || "Multiple Vendors"}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-gray-900">
                      {invoice.dateRange?.start?.slice(0, 10)} to {invoice.dateRange?.end?.slice(0, 10)}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-gray-900 font-semibold">₹{invoice.totalAmount}</td>
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
                        {invoice.status || "generated"}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <button
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                        onClick={() => handlePreview(invoice)}
                        title="Preview"
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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Invoice Preview</h2>
                <div className="text-gray-500 text-xs sm:text-sm">
                  Invoice #: <span className="font-mono">{selectedInvoice.invoiceNumber}</span>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-red-500 transition-colors text-2xl font-bold"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-4 sm:px-8 py-4 sm:py-6">
              {/* Invoice Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Vendor:</span>{" "}
                    <span className="text-gray-900">{selectedInvoice.vendor_id?.email || "Multiple Vendors"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Date Range:</span>{" "}
                    <span className="text-gray-900">
                      {selectedInvoice.dateRange?.start?.slice(0, 10)} to {selectedInvoice.dateRange?.end?.slice(0, 10)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Status:</span>{" "}
                    <span className="text-gray-900">{selectedInvoice.status || "generated"}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col justify-center">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">₹{selectedInvoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Tax ({selectedInvoice.taxRate || 10}%):</span>
                    <span className="font-medium text-gray-900">₹{selectedInvoice.tax}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>₹{selectedInvoice.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Status</label>
                <div className="flex items-center gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    disabled={statusUpdating}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={statusUpdating || newStatus === (selectedInvoice.status || "draft")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {statusUpdating ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm mb-4 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-2 px-2 sm:px-3">Product</th>
                        <th className="text-left py-2 px-2 sm:px-3">Qty</th>
                        <th className="text-left py-2 px-2 sm:px-3">Price</th>
                        <th className="text-left py-2 px-2 sm:px-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="py-2 px-2 sm:px-3">{item.productName}</td>
                          <td className="py-2 px-2 sm:px-3">{item.quantity}</td>
                          <td className="py-2 px-2 sm:px-3">₹{item.price}</td>
                          <td className="py-2 px-2 sm:px-3">₹{item.total}</td>
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
                    <span className="mb-1 text-xs text-gray-500">QR Code</span>
                    <img src={selectedInvoice.qrCode} alt="QR Code" className="w-20 h-20 border rounded" />
                  </div>
                )}
                <a
                  href={`/api/invoices/${selectedInvoice._id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium mt-4 sm:mt-0"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceList