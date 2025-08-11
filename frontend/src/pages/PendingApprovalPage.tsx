import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const PendingApprovalPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("pendingApprovalTitle")}</h1>
        <p className="text-gray-600 mb-6">
          {t("pendingApprovalDesc")}
        </p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("goBackToLogin")}
        </Link>
      </div>
    </div>
  )
}

export default PendingApprovalPage