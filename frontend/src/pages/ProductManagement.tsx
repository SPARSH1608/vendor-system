"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, Filter } from "lucide-react";
import {
  fetchProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  toggleProductStatus,
  fetchVendorsByProduct,
} from "../store/slices/productSlice";
import { productsAPI } from "../services/api";
import type { AppDispatch, RootState } from "../store/store";
import ProductCard from "../components/ProductCard";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import ConfirmationModal from "../components/ConfirmationModal";
import VendorModal from "../components/VendorModal";
import { useTranslation } from "react-i18next";

// Define Product type for type safety
type Product = {
  _id: string;
  name: string;
  name_gu?: string;
  description: string;
  price: number;
  category: string;
  stock_unit: string;
  image?: string;
  isActive: boolean;
  created_by: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  isSelected?: boolean;
};

const ProductManagement = () => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductVendors, setSelectedProductVendors] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, vendors, vendorsLoading, vendorsError } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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
    t("Dairy Products"),
    t("Oils"),
  ];

  // Ensure products is always an array for filtering
  const productsArray: Product[] = Array.isArray(products)
    ? products as Product[]
    : Object.values(products) as Product[];

  const filteredProducts: Product[] = productsArray.filter((product: Product) => {
    const displayName = (product?.name_gu || product?.name || "").trim();
    const description = (product?.description || "").trim();
    const search = searchTerm.trim();

    // If search is empty, show all products
    if (!search) return selectedCategory === t("allCategories") || product.category === selectedCategory;

    // Gujarati search: direct includes
    const matchesGujarati =
      displayName.includes(search) ||
      description.includes(search);

    // English search: case-insensitive
    const matchesEnglish =
      displayName.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());

    const matchesSearch = matchesGujarati || matchesEnglish;
    const matchesCategory =
      selectedCategory === t("allCategories") || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activeProducts: Product[] = filteredProducts.filter((p: Product) => p.isActive);
  const inactiveProducts: Product[] = filteredProducts.filter((p: Product) => !p.isActive);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeleteError("");
      await dispatch(deleteProduct(productId));
      dispatch(fetchProducts());
      setShowDeleteModal(false);
    } catch (error) {
      setDeleteError(t("failedToDeleteProduct"));
    }
  };

  const handleToggleStatus = async (product: Product) => {
    await dispatch(toggleProductStatus(product._id));
    await dispatch(fetchProducts());
  };

  const handleViewVendors = async (product: Product) => {
    // Use Gujarati name if available, else fallback to English name
    setSelectedProductName(product.name_gu || product.name);
    try {
      await dispatch(fetchVendorsByProduct(product._id));
      setShowVendorModal(true);
    } catch (err) {
      alert(t("errorFetchingVendors"));
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 w-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("productManagementTitle")}</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("productManagementDesc")}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addProduct")}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-xs font-medium text-gray-600">{t("totalProducts")}</p>
          <p className="text-lg font-bold text-gray-900">{products.length}</p>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1">
            {products.length} {t("items")}
          </span>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-xs font-medium text-gray-600">{t("activeProducts")}</p>
          <p className="text-lg font-bold text-gray-900">{activeProducts.length}</p>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded mt-1">
            {t("active")}
          </span>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-xs font-medium text-gray-600">{t("inactiveProducts")}</p>
          <p className="text-lg font-bold text-gray-900">{inactiveProducts.length}</p>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded mt-1">
            {t("inactive")}
          </span>
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product: Product) => (
            <ProductCard
              key={product._id}
              product={{
                ...product,
                // Pass display name for rendering in ProductCard
                displayName: product.name_gu || product.name,
              }}
              onEdit={() => handleEditProduct(product)}
              onDelete={() => {
                setSelectedProduct(product);
                setShowDeleteModal(true);
              }}
              // Remove onViewVendors prop if not supported by ProductCard
              // imageClassName prop removed to match ProductCardProps
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t("noProductsFound")}</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (productData) => {
            await dispatch(createProduct(productData));
            await dispatch(fetchProducts());
            setShowAddModal(false);
          }}
        />
      )}

      {showEditModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct as Product}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (productData) => {
            await dispatch(updateProduct({ id: (selectedProduct as Product)._id, productData }));
            await dispatch(fetchProducts());
            setShowEditModal(false);
          }}
        />
      )}

      {showDeleteModal && selectedProduct && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDeleteProduct((selectedProduct as Product)._id)}
          // Use Gujarati name if available, else fallback to English name
          message={t("deleteProductConfirm", { name: (selectedProduct as Product).name_gu || (selectedProduct as Product).name })}
          isProcessing={loading}
          error={deleteError}
        />
      )}

      {showVendorModal && (
        <VendorModal
          isOpen={showVendorModal}
          onClose={() => setShowVendorModal(false)}
          vendors={vendors}
          productName={selectedProductName}
          vendorsLoading={vendorsLoading}
          vendorsError={vendorsError}
        />
      )}
    </div>
  );
};

export default ProductManagement;
