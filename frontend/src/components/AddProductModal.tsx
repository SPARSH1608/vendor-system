"use client";

import type React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { createProduct } from "../store/slices/productSlice";

interface AddProductModalProps {
  onClose: () => void;
  onSubmit: (productData: any) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock_unit: "kg",
    image: "",
  });
  const [imageOption, setImageOption] = useState<"url" | "upload">("url");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const categories = ["vegetables", "fruits", "dairy", "masala", "dry fruits", "pulses"];
  const units = ["kg", "litre", "piece", "gram"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  const handleImageOptionChange = (option: "url" | "upload") => {
    setImageOption(option);
    if (option === "upload") {
      setFormData((prev) => ({ ...prev, image: "" })); // Clear URL when switching to upload
    } else {
      setUploadedImage(null); // Clear file when switching to URL
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = new FormData();
    productData.append("name", formData.name);
    productData.append("description", formData.description);
    productData.append("price", formData.price);
    productData.append("category", formData.category);
    productData.append("stock_unit", formData.stock_unit);
    productData.append("isActive", "true");

    if (imageOption === "upload") {
      if (uploadedImage) {
        productData.append("image", uploadedImage);
      } else {
        alert("Please upload an image file.");
        return;
      }
    } else if (imageOption === "url") {
      if (formData.image && typeof formData.image === "string") {
        productData.append("image", formData.image);
      } else {
        alert("Please enter a valid image URL.");
        return;
      }
    }
console.log("Submitting product data:", productData);
    onSubmit(productData);
  };

  return (
    <div
      className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6">Create a new product for vendors to select from.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <select
                name="stock_unit"
                value={formData.stock_unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="imageOption"
                  value="url"
                  checked={imageOption === "url"}
                  onChange={() => handleImageOptionChange("url")}
                />
                <span>From URL</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="imageOption"
                  value="upload"
                  checked={imageOption === "upload"}
                  onChange={() => handleImageOptionChange("upload")}
                />
                <span>Upload</span>
              </label>
            </div>

            {imageOption === "url" && (
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Enter image URL"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}

            {imageOption === "upload" && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;