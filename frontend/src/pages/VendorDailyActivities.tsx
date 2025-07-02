"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MapPin, Plus, Minus, Trash2 } from "lucide-react"
import { fetchProducts } from "../store/slices/productSlice"
import type { AppDispatch, RootState } from "../store/store"

interface ActivityItem {
  product_id: string
  productName: string
  price: number
  quantity: number
  stock_unit: string
}

const VendorDailyActivity = () => {
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<ActivityItem[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])

  const dispatch = useDispatch<AppDispatch>()
  const { products } = useSelector((state: RootState) => state.products)

  const locations = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata"]

  useEffect(() => {
    dispatch(fetchProducts())

    // Load cart items from localStorage if coming from products page
    const cartItems = localStorage.getItem("vendorCart")
    if (cartItems) {
      setSelectedProducts(JSON.parse(cartItems))
      localStorage.removeItem("vendorCart")
    }
  }, [dispatch])

  useEffect(() => {
    // Filter available products (exclude already selected ones)
    const selectedIds = selectedProducts.map((item) => item.product_id)
    setAvailableProducts(products.filter((product) => product.isActive && !selectedIds.includes(product._id)))
  }, [products, selectedProducts])

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProduct(productId)
      return
    }

    setSelectedProducts((prev) =>
      prev.map((item) => (item.product_id === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.product_id !== productId))
  }

  const addProduct = (product: any) => {
    const newItem: ActivityItem = {
      product_id: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      stock_unit: product.stock_unit,
    }
    setSelectedProducts((prev) => [...prev, newItem])
  }

  const getTotalAmount = () => {
    return selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const getTotalQuantity = () => {
    return selectedProducts.reduce((sum, item) => sum + item.quantity, 0)
  }

  const handleSubmit = async () => {
    if (!selectedLocation) {
      alert("Please select a location")
      return
    }

    if (selectedProducts.length === 0) {
      alert("Please select at least one product")
      return
    }

    const activityData = {
      date: new Date().toISOString().split("T")[0],
      location: selectedLocation,
      items: selectedProducts.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }

    try {
      const response = await fetch("/api/vendors/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(activityData),
      })

      if (response.ok) {
        alert("Daily activity submitted successfully!")
        setSelectedProducts([])
        setSelectedLocation("")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to submit activity")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to submit activity")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Daily Activity</h1>
        <p className="text-gray-600 mt-1">Manage your daily product selection and location</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Select Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Select Location</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Choose your location for today's activity</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Selected Products</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Products for today's activity</p>

            {selectedProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No products selected</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-600">
                        ₹{item.price} per {item.stock_unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity} {item.stock_unit}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeProduct(item.product_id)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Add More Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Add More Products</h2>
            <p className="text-gray-600 text-sm mb-4">Available products to add to your selection</p>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableProducts.slice(0, 10).map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      ₹{product.price} per {product.stock_unit}
                    </p>
                  </div>
                  <button
                    onClick={() => addProduct(product)}
                    className="bg-gray-900 text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Summary</h2>
            <p className="text-gray-600 text-sm mb-4">Today's activity summary</p>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{selectedLocation || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium">{selectedProducts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Quantity:</span>
                <span className="font-medium">{getTotalQuantity()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total Amount:</span>
                <span className="text-green-600">₹{getTotalAmount()}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedLocation || selectedProducts.length === 0}
              className="w-full bg-gray-600 text-white py-3 rounded-lg mt-6 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Daily Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorDailyActivity
