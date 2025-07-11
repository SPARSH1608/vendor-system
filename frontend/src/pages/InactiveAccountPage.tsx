import React from "react"

const InactiveAccountPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Inactive</h1>
        <p className="text-gray-600 mb-6">
          Your account is currently inactive. Please contact the administrator to activate your account.
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          onClick={() => window.location.href = "/login"}
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}

export default InactiveAccountPage