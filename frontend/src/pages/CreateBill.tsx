"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Minus, Trash2, Save, FileText, CreditCard } from "lucide-react"

interface Product {
  _id: string
  product_id: {
    _id: string
    name: string
    price: number
    stock_unit: string
    category: string
  }
}

interface BillItem {
  product_id: string
  productName: string
  price: number
  quantity: number
  stock_unit: string
  total: number
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
}

const CreateBill = () => {
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
  })
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const locations = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"]

  useEffect(() => {
    fetchVendorProducts()
  }, [])

  const fetchVendorProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/vendors/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableProducts(data.data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const addProduct = () => {
    if (!selectedProductId) return

    const product = availableProducts.find((p) => p.product_id._id === selectedProductId)
    if (!product) return

    // Check if product already exists in bill
    const existingItem = billItems.find((item) => item.product_id === selectedProductId)
    if (existingItem) {
      updateQuantity(selectedProductId, existingItem.quantity + 1)
      return
    }

    const newItem: BillItem = {
      product_id: product.product_id._id,
      productName: product.product_id.name,
      price: product.product_id.price,
      quantity: 1,
      stock_unit: product.product_id.stock_unit,
      total: product.product_id.price,
    }

    setBillItems([...billItems, newItem])
    setSelectedProductId("")
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    setBillItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity: newQuantity, total: item.price * newQuantity } : item,
      ),
    )
  }

  const removeItem = (productId: string) => {
    setBillItems((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const getSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.total, 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.1 // 10% tax
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  const saveBill = async (status: "draft" | "unpaid" | "paid") => {
    if (!customer.name || !customer.email || !customer.phone || !location || billItems.length === 0) {
      alert("Please fill in all required fields and add at least one item")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const subtotal = getSubtotal()
      const tax = getTax()
      const totalAmount = getTotal()

      const billData = {
        customer,
        items: billItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        location,
        notes,
        status,
        taxRate: 10,
        subtotal,      // <-- add this
        totalAmount,   // <-- add this
        // billNumber: (optional, let backend generate if not required from frontend)
      }

      const response = await fetch("/api/vendors/bills", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Bill ${status === "draft" ? "saved as draft" : "created"} successfully!`)
        navigate("/vendor/bills")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to create bill")
      }
    } catch (error) {
      console.error("Error creating bill:", error)
      alert("Failed to create bill")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Bill</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Create a bill for your customer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="Enter customer email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Add Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Add Products</h2>
            <div className="flex gap-3">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Select a product</option>
                {availableProducts.map((product) => (
                  <option key={product.product_id._id} value={product.product_id._id}>
                    {product.product_id.name} - ₹{product.product_id.price}/{product.product_id.stock_unit}
                  </option>
                ))}
              </select>
              <button
                onClick={addProduct}
                disabled={!selectedProductId}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Bill Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Bill Items</h2>
            {billItems.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No items added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {billItems.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        ₹{item.price} per {item.stock_unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          if (val > 0) updateQuantity(item.product_id, val)
                        }}
                        className="w-20 sm:w-24 text-center border border-gray-300 rounded px-2 py-2 text-base font-semibold"
                      />
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="w-16 text-right font-semibold text-sm">₹{item.total}</span>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bill Summary */}
          {billItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Bill Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{getSubtotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">₹{getTax()}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span className="text-green-600">₹{getTotal()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <button
                  onClick={() => saveBill("draft")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save as Draft</span>
                </button>
                <button
                  onClick={() => saveBill("unpaid")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>Mark as Unpaid</span>
                </button>
                <button
                  onClick={() => saveBill("paid")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Mark as Paid</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateBill
