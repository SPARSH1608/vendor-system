import React from "react";
import { useTranslation } from "react-i18next";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left text-gray-800 font-medium py-2">
                  {t("name")}
                </th>
                <th className="text-left text-gray-800 font-medium py-2">
                  {t("category")}
                </th>
                <th className="text-left text-gray-800 font-medium py-2">
                  {t("price")}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-gray-200">
                  <td className="py-2 text-gray-800">{product.name}</td>
                  <td className="py-2 text-gray-600">{product.category}</td>
                  <td className="py-2 text-gray-600">₹{product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          onClick={onClose}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full"
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
};

export default VendorProductsModal;