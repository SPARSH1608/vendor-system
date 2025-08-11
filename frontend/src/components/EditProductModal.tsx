"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EditProductModalProps {
  product: any; // Product data to pre-fill the form
  onClose: () => void;
  onSubmit: (productData: any) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || "",
    category: product.category || "",
    stock_unit: product.stock_unit || "kg",
    image: product.image || "",
  });
  const [imageOption, setImageOption] = useState<"url" | "upload">("url");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const categories = [
    t("vegetables"),
    t("fruits"),
    t("dairy"),
    t("masala"),
    t("dryFruits"),
    t("pulses"),
  ];
  const units = [t("kg"), t("litre"), t("piece"), t("gram")];

  // Reset state when product changes
  useEffect(() => {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      stock_unit: product.stock_unit || "kg",
      image: product.image || "",
    });
    setImageOption("url");
    setUploadedImage(null);
  }, [product]);

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

  // Fix: clear the other value when switching image option
  const handleImageOptionChange = (option: "url" | "upload") => {
    setImageOption(option);
    if (option === "upload") {
      setFormData((prev) => ({ ...prev, image: "" }));
    } else {
      setUploadedImage(null);
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

    if (imageOption === "upload" && uploadedImage) {
      productData.append("image", uploadedImage);
    } else if (imageOption === "url" && formData.image) {
      productData.append("image", formData.image);
    }

    onSubmit(productData);
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm border-black">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t("editProduct")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("productName")} *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("enterProductName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("description")}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("enterDescription")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("price")} (₹) *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("unit")} *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("category")} *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">{t("selectCategory")}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("image")}</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="imageOption"
                  value="url"
                  checked={imageOption === "url"}
                  onChange={() => handleImageOptionChange("url")}
                />
                <span>{t("fromUrl")}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="imageOption"
                  value="upload"
                  checked={imageOption === "upload"}
                  onChange={() => handleImageOptionChange("upload")}
                />
                <span>{t("upload")}</span>
              </label>
            </div>

            {imageOption === "url" && (
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder={t("enterImageUrl")}
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
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;