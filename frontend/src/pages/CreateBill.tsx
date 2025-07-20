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
    image?: string
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
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const locations = [
    "Dr. Babasaheb Ambedkar Open University Campus",
    "Shri Bhagwat Vidyapeeth Temple",
    "Atma vikasa parisara",
    "Navjeevan Trust Campus",
    "Gayatri Temple Trust Campus",
    "Sristi Campus",
    "Vallabh Vidyanagar",
  ]

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
        // Initialize billItems with all products, quantity 0
        setBillItems(
          data.data.map((product: Product) => ({
            product_id: product.product_id._id,
            productName: product.product_id.name,
            price: product.product_id.price,
            quantity: 0,
            stock_unit: product.product_id.stock_unit,
            total: 0,
          }))
        )
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity: newQuantity < 0 ? 0 : newQuantity,
              total: newQuantity < 0 ? 0 : item.price * newQuantity,
            }
          : item
      )
    )
  }

  const removeItem = (productId: string) => {
    setBillItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: 0, total: 0 }
          : item
      )
    )
  }

  const getSubtotal = () => {
    return billItems.reduce((sum, item) => sum + (item.quantity > 0 ? item.total : 0), 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.1 // 10% tax
  }

  const getTotal = () => {
    return getSubtotal(); // No tax calculation
  }

  const saveBill = async (status: "draft" | "unpaid" | "paid") => {
    const selectedItems = billItems.filter((item) => item.quantity > 0)
    if (!customer.name || !customer.email || !customer.phone || !location || selectedItems.length === 0) {
      alert("Please fill in all required fields and add at least one item")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const subtotal = getSubtotal()
      const totalAmount = getTotal()

      const billData = {
        customer,
        items: selectedItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        location,
        notes,
        status,
        subtotal,
        totalAmount,
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

  // Responsive full width for large screens, mobile friendly
  return (
    <div className="space-y-6 px-0 sm:px-2 md:px-4 lg:px-8 w-full max-w-none mx-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Bill</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Select product quantities and enter customer details</p>
      </div>

      {/* Product Selection Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Select Products & Quantities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {billItems.map((item, idx) => {
            const product = availableProducts.find((p) => p.product_id._id === item.product_id)
            return (
              <div
                key={item.product_id}
                className="bg-gray-50 rounded-lg p-2 sm:p-4 flex flex-col items-center gap-2 shadow-sm border border-gray-200"
              >
                <img
                  src={product?.product_id?.image || "/placeholder-product.png"}
                  alt={item.productName}
                  className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-md border border-gray-200 bg-white"
                  loading="lazy"
                  onError={e => { e.currentTarget.src = "/placeholder-product.png" }}
                />
                <h4 className="font-medium text-gray-900 truncate text-xs sm:text-base">{item.productName}</h4>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  ₹{item.price} per {item.stock_unit}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      updateQuantity(item.product_id, val)
                    }}
                    className="w-12 sm:w-20 text-center border border-gray-300 rounded px-1 py-1 sm:px-2 sm:py-2 text-base font-semibold"
                  />
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-green-700 mt-1">
                  {item.quantity > 0 ? `₹${item.total}` : ""}
                </span>
                {item.quantity > 0 && (
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bill Summary */}
      {billItems.some((item) => item.quantity > 0) && (
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
        </div>
      )}

      {/* Customer Details */}
      {billItems.some((item) => item.quantity > 0) && (
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
      )}

      {/* Bill Actions */}
      {billItems.some((item) => item.quantity > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex flex-col gap-2 mt-2">
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
  )
}

export default CreateBill
