"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Search, Filter, Check, Plus } from "lucide-react"
import {
  fetchVendorProducts,
  selectVendorProduct,
  deselectVendorProduct,
} from "../store/slices/vendorProductSlice"
import type { RootState, AppDispatch } from "../store/store"
import { useTranslation } from "react-i18next"

const VendorProducts = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>()
  const { products, loading, selectedCount } = useSelector(
    (state: RootState) => state.vendorProducts,
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  useEffect(() => {
    dispatch(fetchVendorProducts())
  }, [dispatch])

  const handleToggleProduct = (productId: string, isSelected: boolean) => {
    if (isSelected) {
      dispatch(deselectVendorProduct(productId))
    } else {
      dispatch(selectVendorProduct(productId))
    }
  }

  const categories = [
    t("allCategories"),
    t("Dry Fruits"),
    t("Masala"),
    t("Uncultivated"),
    t("Pulses"),
    t("Aruvedic"),
    t("Ghee"),
    t("Mukhvas"),
    t("Vegetable"),
    t("Fruits"),
    t("Flour"),
    t("Jaggery"),
    t("Others"),
    t("Millets"),
    t("Grains"),
    t("Juice"),
    t("Healthy Diets"),
    t("Sugar"),
    t("Honey"),
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "All Categories" || product.category === selectedCategory
    return matchesSearch && matchesCategory
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

  const getProductInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("allProductsTitle")}</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("allProductsDesc")}</p>
      </div>

      {/* Selection Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 gap-2">
        <span className="text-sm font-medium text-blue-900">{t("selectedProductsSummary", { count: selectedCount })}</span>
        <span className="text-sm text-blue-700">{t("totalProductsAvailable", { count: products.length })}</span>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("searchProducts")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[160px] text-sm"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className={`relative flex flex-col bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                product.isSelected ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-blue-200"
              }`}
            >
              {/* Selection Indicator */}
              {product.isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10 shadow">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="flex justify-center items-center bg-gray-100 aspect-square">
                {product.image ? (
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-2xl font-bold">{getProductInitial(product.name)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{product.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(product.category)}`}>
                    {t(product.category)}
                  </span>
                </div>

                {product.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-gray-900">₹{product.price}</span>
                  <span className="text-xs text-gray-600">{t("perUnit", { unit: product.stock_unit })}</span>
                </div>

                <button
                  onClick={() => handleToggleProduct(product._id, product.isSelected)}
                  className={`mt-auto w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm ${
                    product.isSelected
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {product.isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t("selected")}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{t("selectProduct")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t("noProductsFound")}</p>
        </div>
      )}
    </div>
  )
}

export default VendorProducts
