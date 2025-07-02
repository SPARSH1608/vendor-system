"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Search, Filter, Plus } from 'lucide-react'
import { fetchProducts } from "../store/slices/productSlice"
import type { AppDispatch, RootState } from "../store/store"

interface CartItem {
  product_id: string
  productName: string
  price: number
  quantity: number
  category: string
  stock_unit: string
}

const VendorProducts = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [cart, setCart] = useState<CartItem[]>([])

  const dispatch = useDispatch<AppDispatch>()
  const { products, loading } = useSelector((state: RootState) => state.products)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const categories = ["All Categories", "vegetables", "fruits", "dairy", "masala", "dry fruits", "pulses"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory
    return matchesSearch && matchesCategory && product.isActive
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      vegetables: "bg-green-100 text-green-600",
      fruits: "bg-orange-100 text-orange-600",
      dairy: "bg-blue-100 text-blue-600",
      masala: "bg-red-100 text-red-600",
      "dry fruits": "bg-yellow-100 text-yellow-600",
      pulses: "bg-purple-100 text-purple-600",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-600"
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.product_id === product._id)
    if (existingItem) {
      setCart(cart.map((item) => 
        item.product_id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product._id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
        stock_unit: product.stock_unit
      }])
    }
  }

  const getProductInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Products</h1>
        <p className="text-gray-600 mt-1">Select products for your daily activity</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-2xl font-bold">
                      {getProductInitial(product.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-sm text-gray-600 ml-1">per {product.stock_unit}</span>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}

      {/* Cart Summary (if items in cart) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px]">
          <h3 className="font-semibold text-gray-900 mb-2">Cart Summary</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span>{item.productName} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              // Navigate to daily activity page with cart items
              localStorage.setItem('vendorCart', JSON.stringify(cart))
              window.location.href = '/vendor/activity'
            }}
            className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3 hover:bg-blue-700 transition-colors"
          >
            Continue to Daily Activity
          </button>
        </div>
      )}
    </div>
  )
}

export default VendorProducts
