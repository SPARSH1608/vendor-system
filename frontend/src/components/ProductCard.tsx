"use client";

import type React from "react";
import { useState } from "react";
import { Edit, Trash, ToggleLeft, ToggleRight, Loader } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateProduct, fetchProducts } from "../store/slices/productSlice";
import type { AppDispatch } from "../store/store";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock_unit: string;
  image?: string;
  isActive: boolean;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void; // Callback for editing a product
  onDelete: (productId: string) => void; // Callback for deleting a product
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false); // Loading state for toggle button

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

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center mb-4 rounded-lg overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-2xl">📦</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 truncate">{product.description}</p>
        <p className="text-sm font-medium text-gray-800 mt-1">
          ₹{product.price} per {product.stock_unit}
        </p>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between mt-4">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              product.isActive ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span
            className={`text-sm transition-colors duration-300 ${
              product.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleProductStatus}
            disabled={isLoading}
            className={`p-2 rounded-full transition-transform duration-300 ${
              product.isActive ? "bg-green-100 hover:bg-green-200" : "bg-red-100 hover:bg-red-200"
            }`}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 text-gray-500 animate-spin" />
            ) : product.isActive ? (
              <ToggleRight className="w-5 h-5 text-green-500" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-red-500" />
            )}
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Trash className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
