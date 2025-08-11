"use client";

import React, { useState } from "react";
import { Edit, Trash, ToggleLeft, ToggleRight, Loader } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateProduct, fetchProducts } from "../store/slices/productSlice";
import type { AppDispatch } from "../store/store";
import { useTranslation } from "react-i18next";

interface Product {
  _id: string;
  name: string;
  name_gu?: string;
  description?: string;
  price: number;
  category: string;
  stock_unit: string;
  image?: string;
  isActive: boolean;
  displayName?: string; // Added for fallback
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const toggleProductStatus = async () => {
    setIsLoading(true);
    await dispatch(
      updateProduct({
        id: product._id,
        productData: { isActive: !product.isActive },
      })
    );
    await dispatch(fetchProducts());
    setIsLoading(false);
  };

  // Use displayName if passed, else fallback to Gujarati name, else English name
  const displayName = product.displayName || product.name_gu || product.name;

  return (
    <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-xs">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center mb-1 rounded-md overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-400 text-lg">📦</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div>
        <h3 className="text-xs font-semibold text-gray-900 truncate">
          {displayName}
        </h3>
        <p className="text-xs text-gray-600 truncate">{product.description}</p>
        <p className="text-xs font-medium text-gray-800 mt-1">
          ₹{product.price} {t("per")} {product.stock_unit}
        </p>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between mt-1">
        {/* Status Indicator */}
        <div className="flex items-center space-x-1">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              product.isActive ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span
            className={`text-xs transition-colors duration-300 ${
              product.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.isActive ? t("active") : t("inactive")}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleProductStatus}
            disabled={isLoading}
            className={`p-1 rounded-full transition-transform duration-300 ${
              product.isActive ? "bg-green-100 hover:bg-green-200" : "bg-red-100 hover:bg-red-200"
            }`}
          >
            {isLoading ? (
              <Loader className="w-3 h-3 text-gray-500 animate-spin" />
            ) : product.isActive ? (
              <ToggleRight className="w-3 h-3 text-green-500" />
            ) : (
              <ToggleLeft className="w-3 h-3 text-red-500" />
            )}
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-3 h-3 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Trash className="w-3 h-3 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;