"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Plus, Search, Filter } from "lucide-react"
import { fetchProducts, createProduct, deleteProduct, updateProduct, toggleProductStatus } from "../store/slices/productSlice"
import type { AppDispatch, RootState } from "../store/store"
import ProductCard from "../components/ProductCard"
import AddProductModal from "../components/AddProductModal"
import EditProductModal from "../components/EditProductModal"
import ConfirmationModal from "../components/ConfirmationModal"

const ProductManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deleteError, setDeleteError] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { products, loading } = useSelector((state: RootState) => state.products)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const categories = ["All Categories", "vegetables", "fruits", "dairy", "masala", "dry fruits", "pulses"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const activeProducts = filteredProducts.filter((p) => p.isActive)
  const inactiveProducts = filteredProducts.filter((p) => !p.isActive)

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleDeleteProduct = async (productId) => {
    try {
      setDeleteError("")
      await dispatch(deleteProduct(productId))
      dispatch(fetchProducts())
      setShowDeleteModal(false)
    } catch (error) {
      setDeleteError("Failed to delete product. Please try again.")
    }
  }

  const handleToggleStatus = async (product) => {
    await dispatch(toggleProductStatus(product._id));
    await dispatch(fetchProducts());
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{products.length}</p>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-2">{products.length} Items</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Active Products</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeProducts.length}</p>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded mt-2">Active</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-between">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Inactive Products</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{inactiveProducts.length}</p>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded mt-2">Inactive</span>
        </div>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={() => {
                setSelectedProduct(product)
                setShowDeleteModal(true)
              }}
              onToggleStatus={handleToggleStatus}
              imageClassName="h-24 w-24 object-cover mx-auto"
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (productData) => {
            await dispatch(createProduct(productData))
            await dispatch(fetchProducts())
            setShowAddModal(false)
          }}
        />
      )}

      {showEditModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (productData) => {
            await dispatch(updateProduct({ id: selectedProduct._id, productData }));
            await dispatch(fetchProducts());
            setShowEditModal(false);
          }}
        />
      )}

      {showDeleteModal && selectedProduct && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDeleteProduct(selectedProduct._id)}
          message={`Are you sure you want to delete "${selectedProduct.name}"?`}
          isProcessing={loading}
          error={deleteError}
        />
      )}
    </div>
  )
}

export default ProductManagement
