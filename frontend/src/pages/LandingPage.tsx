import { Link, Navigate } from "react-router-dom"
import { ShoppingCart, Users, FileText, BarChart3, CheckCircle } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "../store/store"
import { useTranslation } from "react-i18next"

const LandingPage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth)

  if (user && user.isActive && user.role === "user") {
    return <Navigate to="/pending" />
  }

  const features = [
    t("featureOnboarding"),
    t("featureInventory"),
    t("featureBilling"),
    t("featureLocation"),
    t("featureHistory"),
    t("featureQR"),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VM</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">{t("vendorManagement")}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                {t("login")}
              </Link>
              <Link
                to="/register"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t("getStarted")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t("streamlineYour")} <span className="text-blue-600">{t("vendorManagement")}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t("heroDesc")}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t("startFreeTrial")} →
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("powerfulFeatures")}</h2>
          <p className="text-lg text-gray-600">{t("featuresDesc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("productManagement")}</h3>
            <p className="text-gray-600 text-sm">{t("productManagementDesc")}</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("userManagement")}</h3>
            <p className="text-gray-600 text-sm">{t("userManagementDesc")}</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("invoiceGeneration")}</h3>
            <p className="text-gray-600 text-sm">{t("invoiceGenerationDesc")}</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("analyticsReports")}</h3>
            <p className="text-gray-600 text-sm">{t("analyticsReportsDesc")}</p>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("whyChooseTitle")}</h2>
              <p className="text-lg text-gray-600 mb-8">{t("whyChooseDesc")}</p>

              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-4">{t("readyToGetStarted")}</h3>
              <p className="text-blue-100 mb-6">{t("joinBusinesses")}</p>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-block"
              >
                {t("createAccount")} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
