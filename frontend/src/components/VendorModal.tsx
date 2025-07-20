import React from "react";

const VendorModal = ({
  isOpen,
  onClose,
  vendors,
  productName,
  vendorsLoading,
  vendorsError,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border-2 border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Vendors for {productName}
        </h2>
        {vendorsLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading vendors...</p>
          </div>
        ) : vendorsError ? (
          <div className="text-center py-4 text-red-500">{vendorsError}</div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No vendors have selected this product.
          </div>
        ) : (
          <ul className="space-y-4">
            {vendors.map((vendor) => (
              <li
                key={vendor._id}
                className="border rounded-lg p-4 shadow-sm"
              >
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
          Close
        </button>
      </div>
    </div>
  );
};

export default VendorModal;