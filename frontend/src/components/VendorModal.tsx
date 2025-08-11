import React from "react";
import { useTranslation } from "react-i18next";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: Vendor[];
  productName: string;
  vendorsLoading: boolean;
  vendorsError: string | null;
}

const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  vendors,
  productName,
  vendorsLoading,
  vendorsError,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border-2 border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {t("vendorsFor")} {productName}
        </h2>
        {vendorsLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">{t("loadingVendors")}</p>
          </div>
        ) : vendorsError ? (
          <div className="text-center py-4 text-red-500">{vendorsError}</div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {t("noVendorsSelected")}
          </div>
        ) : (
          <ul className="space-y-4">
            {vendors.map((vendor) => (
              <li key={vendor._id} className="border rounded-lg p-4 shadow-sm">
                <p className="font-medium text-gray-800">{vendor.name}</p>
                <p className="text-sm text-gray-600">{vendor.email}</p>
                <p className="text-sm text-gray-600">{vendor.phone}</p>
              </li>
            ))}
          </ul>
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

export default VendorModal;