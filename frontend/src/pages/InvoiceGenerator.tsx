"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FileText, Download, QrCode } from "lucide-react"
import { generateInvoice } from "../store/slices/invoiceSlice"
import type { AppDispatch, RootState } from "../store/store"

const InvoiceGenerator = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentInvoice, loading } = useSelector((state: RootState) => state.invoices)

  const [invoiceOptions, setInvoiceOptions] = useState({
    type: "All Vendors",
    startDate: "",
    endDate: "",
  })

  const handleGenerateInvoice = () => {
    dispatch(
      generateInvoice({
        vendorId: invoiceOptions.type === "All Vendors" ? undefined : invoiceOptions.type,
        startDate: invoiceOptions.startDate,
        endDate: invoiceOptions.endDate,
      }),
    )
  }

  // Mock invoice data for demonstration
  const mockInvoice = {
    _id: "INV-2024-001",
    vendor_id: "vendor1",
    vendorEmail: "vendor1@example.com",
    dateRange: {
      start: "2024-01-01",
      end: "2024-01-15",
    },
    location: "Delhi",
    items: [
      { productName: "Basmati Rice", quantity: 150, price: 120, total: 18000 },
      { productName: "Wheat", quantity: 100, price: 35, total: 3500 },
      { productName: "Milk", quantity: 50, price: 60, total: 3000 },
    ],
    subtotal: 24500,
    tax: 2450,
    totalAmount: 26950,
  }

  const displayInvoice = currentInvoice || mockInvoice

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
        <p className="text-gray-600 mt-1">Generate invoices for vendors and transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                <option value="vendor1">vendor1@example.com</option>
                <option value="vendor2">vendor2@example.com</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={invoiceOptions.startDate}
                onChange={(e) => setInvoiceOptions({ ...invoiceOptions, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={invoiceOptions.endDate}
                onChange={(e) => setInvoiceOptions({ ...invoiceOptions, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleGenerateInvoice}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Invoice Preview</h2>
          <p className="text-gray-600 text-sm mb-6">Generated invoice will appear here</p>

          {displayInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">INVOICE</h3>
                  <p className="text-gray-600">#{displayInvoice._id}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">Vendor: {displayInvoice.vendorEmail}</p>
                  <p className="text-sm text-gray-600">
                    Period: {displayInvoice.dateRange.start} to {displayInvoice.dateRange.end}
                  </p>
                  <p className="text-sm text-gray-600">Location: {displayInvoice.location}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity} kg</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{item.price}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{item.total}</td>
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
              <div className="flex space-x-4 pt-4">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <QrCode className="w-4 h-4" />
                  <span>Generate QR</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceGenerator
