"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, Activity as ActivityIcon } from "lucide-react"
import { vendorsAPI } from "../services/api"
import { useTranslation } from "react-i18next"

interface ActivityItem {
  product_id: string
  productName: string
  quantity: number
  price: number
  total: number
}

interface Activity {
  _id: string
  vendor_id: { _id: string; name: string }
  vendorName: string
  date: string
  location: string
  items: ActivityItem[]
  totalAmount: number
}

const VendorActivities = () => {
  const { t } = useTranslation();
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])

  // Fetch all activities once
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        const res = await vendorsAPI.getVendorActivities({})
        setAllActivities(res.data) // Store all activities
        setActivities(res.data) // Initially, show all activities
      } catch (err) {
        console.error("Error fetching activities:", err)
        setAllActivities([])
        setActivities([])
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  // Generate unique vendors for the dropdown
  useEffect(() => {
    if (allActivities.length > 0) {
      const uniqueVendors = Array.from(
        new Map(
          allActivities.map((a) => [a.vendor_id._id, { id: a.vendor_id._id, name: a.vendor_id.name }])
        ).values()
      )
      setVendors(uniqueVendors)
    }
  }, [allActivities])

  // Generate unique products for the dropdown
  useEffect(() => {
    if (allActivities.length > 0) {
      const allProducts = allActivities.flatMap((activity) => 
        activity.items.map((item) => {
          // Handle case where product_id is an object
          const productId = typeof item.product_id === 'object' 
            ? item.product_id._id 
            : item.product_id
        
          return {
            id: productId,
            name: item.productName
          }
        })
      )
      
      // Remove duplicates by product_id
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      )
      
      setProducts(uniqueProducts)
    }
  }, [allActivities])

  // Apply filters on the frontend
  useEffect(() => {
    let filtered = allActivities

    if (selectedVendor) {
      filtered = filtered.filter((activity) => activity.vendor_id._id === selectedVendor)
    }

    if (selectedProduct) {
      filtered = filtered.filter((activity) =>
        activity.items.some((item) => {
          // Handle case where product_id is an object
          const productId = typeof item.product_id === 'object' 
            ? item.product_id._id 
            : item.product_id
        
          return productId === selectedProduct
        })
      )
    }

    setActivities(filtered)
  }, [selectedVendor, selectedProduct, allActivities])

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
    return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString))
  }

  const getLocationKey = (location: string) => {
    switch (location) {
      case "Dr. Babasaheb Ambedkar Open University Campus":
        return "location1";
      case "Shri Bhagwat Vidyapeeth Temple":
        return "location2";
      case "Atma vikasa parisara":
        return "location3";
      case "Navjeevan Trust Campus":
        return "location4";
      case "Gayatri Temple Trust Campus":
        return "location5";
      case "Sristi Campus":
        return "location6";
      case "Vallabh Vidyanagar":
        return "location7";
      default:
        return location; // fallback to raw value if not found
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("vendorActivitiesTitle")}</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">{t("vendorActivitiesDesc")}</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("filters")}</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("vendor")}</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("allVendors")}</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("product")}</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("allProducts")}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ActivityIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t("vendorActivitiesSectionTitle")}</h2>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">{t("vendorActivitiesSectionDesc")}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div key={activity._id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {activity.vendorName?.charAt(0).toUpperCase() || "V"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 break-all">{activity.vendorName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(activity.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">
                          {t(getLocationKey(activity.location))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">{t("currency")}{activity.totalAmount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(activity.items || []).map((item, index) => {
                    const productId = typeof item.product_id === 'object'
                      ? item.product_id._id
                      : item.product_id

                    return (
                      <div
                        key={`${productId}-${index}`}
                        className={`p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between ${
                          selectedProduct && productId === selectedProduct
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {item.quantity} × {t("currency")}{item.price}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900 mt-2 sm:mt-0">{t("currency")}{item.total}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">{t("noActivitiesFound")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorActivities
