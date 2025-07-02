"use client"

import type React from "react"
import { Edit, ToggleLeft, ToggleRight } from "lucide-react"
import { useDispatch } from "react-redux"
import { updateProduct } from "../store/slices/productSlice"
import type { AppDispatch } from "../store/store"

interface Product {
  _id: string
  name: string
  description?: string
  price: number
  category: string
  stock_unit: string
  image?: string
  isActive: boolean
}

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>()

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

  const toggleProductStatus = () => {
    dispatch(
      updateProduct({
        id: product._id,
        productData: { isActive: !product.isActive },
      }),
    )
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-center">
      <div className="aspect-square bg-gray-100 flex items-center justify-center mb-4">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-2xl">📦</span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
      <p className="text-xs text-gray-600 truncate">{product.description}</p>
      <p className="text-sm font-medium text-gray-800 mt-1">₹{product.price}</p>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          <span className="text-sm text-gray-600 ml-1">per {product.stock_unit}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleProductStatus} className="flex items-center space-x-1">
            {product.isActive ? (
              <ToggleRight className="w-5 h-5 text-green-500" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${product.isActive ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className={`text-sm ${product.isActive ? "text-green-600" : "text-red-600"}`}>
            {product.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default ProductCard
