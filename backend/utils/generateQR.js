const QRCode = require("qrcode")

const generateQR = async (data, options = {}) => {
  try {
    const defaultOptions = {
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 200,
      ...options,
    }

    const qrCodeDataURL = await QRCode.toDataURL(data, defaultOptions)
    return qrCodeDataURL
  } catch (error) {
    console.error("QR Code generation error:", error)
    throw new Error("Failed to generate QR code")
  }
}

module.exports = generateQR
