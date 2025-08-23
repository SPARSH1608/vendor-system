"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { loginUser } from "../store/slices/authSlice"
import type { AppDispatch, RootState } from "../store/store"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useTranslation } from "react-i18next"

const LoginPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("loggedIn") === "true") {
      const role = localStorage.getItem("role");
      if (role === "super_admin") {
        navigate("/super-admin", { replace: true });
      } else if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "vendor") {
        navigate("/vendor/bills/create", { replace: true });
      } else if (role === "user") {
        navigate("/pending", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [navigate]);

  const { loading, error } = useSelector((state: RootState) => state.auth)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await dispatch(loginUser(formData)).unwrap()
      localStorage.setItem("loggedIn", "true") // <-- Set loggedIn flag

      // Redirect based on role
      if (result.user.role === "super_admin") {
        navigate("/super-admin", { replace: true })
      } else if (result.user.role === "admin") {
        navigate("/admin", { replace: true })
      } else if (result.user.role === "vendor") {
        navigate("/vendor/bills/create", { replace: true })
      } else if (result.user.role === "user") {
        navigate("/pending", { replace: true })
      }else{
        navigate("/", { replace: true })
      }
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("welcomeBack")}</h1>
          <p className="text-gray-600">{t("signInDesc")}</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t("email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("enterEmail")}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t("password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t("enterPassword")}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={t("togglePassword")}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? t("signingIn") : t("signIn")}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            {t("dontHaveAccount")}{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
