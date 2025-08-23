import React from "react";
import { useTranslation } from "react-i18next";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string; // <-- add this line
}

interface VendorProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  vendorName: string;
}

const VendorProductsModal: React.FC<VendorProductsModalProps> = ({
  isOpen,
  onClose,
  products,
  vendorName,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg border-4 border-gray-300">
        <h2 className="font-bold text-lg mb-2">
          {t("productsFor", { name: vendorName })}
        </h2>
        {(!products || products.length === 0) ? (
          <div className="text-center text-gray-500 py-8">
            {t("noProductsFound")}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {products.map((product) => (
              <li key={product._id} className="py-3">
                <div className="font-semibold">{product.name}</div>
                {product.description && (
                  <div className="text-gray-500 text-sm">
                    {product.description}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1">
                  {t("category")}: {product.category} | {t("price")}: ₹
                  {product.price}
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={onClose}
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
};

export default VendorProductsModal;