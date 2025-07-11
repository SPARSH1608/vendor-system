import React from "react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  message: string
  isProcessing: boolean
  error?: string // Add error prop to display error messages
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message, isProcessing, error }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <p className="text-gray-800 text-center mb-4">{message}</p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg ${
              isProcessing ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal