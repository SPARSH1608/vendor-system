"use client"

import { useState, useEffect } from "react"
import { FileText, Download } from "lucide-react"
import { invoicesAPI, usersAPI } from "../services/api"

const InvoiceGenerator = () => {
  const [invoiceOptions, setInvoiceOptions] = useState({
    type: "All Vendors",
    startDate: "",
    endDate: "",
  })
  const [vendors, setVendors] = useState<{ _id: string; email: string }[]>([])
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

  const handleDownloadPDF = async () => {
    if (!invoice?._id) return
    try {
      const response = await fetch(
        `/api/invoices/${invoice._id}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      if (!response.ok) throw new Error("Failed to download PDF")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${invoice._id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert("Failed to download PDF")
    }
  }

  const displayInvoice = invoice

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoice Generator</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Generate invoices for vendors and transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Invoice Options</h2>
          </div>
          <p className="text-gray-600 text-sm mb-6">Configure invoice parameters</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Type</label>
              <select
                value={invoiceOptions.type}
                onChange={(e) => setInvoiceOptions({ ...invoiceOptions, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Vendors">All Vendors</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={invoiceOptions.startDate}
                onChange={(e) => setInvoiceOptions({ ...invoiceOptions, startDate: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
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
              {loading ? "Generating..." : "Generate Invoice"}
            </button>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Invoice Preview</h2>
          <p className="text-gray-600 text-sm mb-6">Generated invoice will appear here</p>

          {displayInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">INVOICE</h3>
                  <p className="text-gray-600">#{displayInvoice._id || displayInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <p className="font-medium text-gray-900">
                    Vendor: {displayInvoice.vendorEmail || "Multiple Vendors"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Period: {displayInvoice.dateRange?.start?.slice(0, 10)} to {displayInvoice.dateRange?.end?.slice(0, 10)}
                  </p>
                  <p className="text-sm text-gray-600">Location: {displayInvoice.location || "Multiple Locations"}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm mb-4 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 text-left">Product</th>
                      <th className="px-2 sm:px-4 py-2 text-left">Quantity</th>
                      <th className="px-2 sm:px-4 py-2 text-left">Price</th>
                      <th className="px-2 sm:px-4 py-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayInvoice.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-2 sm:px-4 py-2">{item.productName}</td>
                        <td className="px-2 sm:px-4 py-2">{item.quantity} kg</td>
                        <td className="px-2 sm:px-4 py-2">₹{item.price}</td>
                        <td className="px-2 sm:px-4 py-2">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Total */}
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{displayInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">₹{displayInvoice.tax}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{displayInvoice.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  onClick={handleDownloadPDF}
                  disabled={!displayInvoice._id}
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                {displayInvoice.qrCode && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="mb-1 text-xs text-gray-500">QR Code</span>
                    <img src={displayInvoice.qrCode} alt="QR Code" className="w-20 h-20" />
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
