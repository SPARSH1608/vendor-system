import React from "react";
import { useTranslation } from "react-i18next";

const InactiveAccountPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t("accountInactive")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("contactAdminToActivate")}
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          onClick={() => (window.location.href = "/login")}
        >
          {t("goToLogin")}
        </button>
      </div>
    </div>
  );
};

export default InactiveAccountPage;