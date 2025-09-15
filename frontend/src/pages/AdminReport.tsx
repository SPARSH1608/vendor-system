import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Layout/Navbar";
import { reportAPI } from "../services/api";

// Helper to format date for input[type="date"]
function formatDate(date: Date | string | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

const AdminReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"vendor" | "product">("vendor");
  const [vendorSales, setVendorSales] = useState([]);
  const [productSalesByPlace, setProductSalesByPlace] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch data when filters change
  useEffect(() => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    if (activeTab === "vendor") {
      reportAPI.getVendorSales(params)
        .then(setVendorSales)
        .catch(console.error);
    } else {
      reportAPI.getProductSalesByPlace(params)
        .then(setProductSalesByPlace)
        .catch(console.error);
    }
    setLocationFilter("");
    setNameFilter("");
  }, [activeTab, startDate, endDate]);

  // Get unique locations and names for dropdowns
  const locationOptions = useMemo(() => {
    const data = activeTab === "vendor" ? vendorSales : productSalesByPlace;
    return Array.from(new Set(data.map((row: any) => row.placeName))).filter(Boolean);
  }, [activeTab, vendorSales, productSalesByPlace]);

  const nameOptions = useMemo(() => {
    const data = activeTab === "vendor" ? vendorSales : productSalesByPlace;
    const key = "productName";
    return Array.from(new Set(data.map((row: any) => row[key]))).filter(Boolean);
  }, [activeTab, vendorSales, productSalesByPlace]);

  // Filter logic (includes date filtering on frontend)
  const filteredVendorSales = vendorSales.filter((row: any) =>
    (locationFilter === "" || row.placeName === locationFilter) &&
    (nameFilter === "" || row.productName === nameFilter) &&
    (!startDate || new Date(row.date) >= new Date(startDate)) &&
    (!endDate || new Date(row.date) <= new Date(endDate))
  );

  const filteredProductSales = productSalesByPlace.filter((row: any) =>
    (locationFilter === "" || row.placeName === locationFilter) &&
    (nameFilter === "" || row.productName === nameFilter) &&
    (!startDate || new Date(row.date) >= new Date(startDate)) &&
    (!endDate || new Date(row.date) <= new Date(endDate))
  );

  // Download CSV utility
  function downloadCSV(data: any[], filename: string) {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csvRows = [
      keys.join(","),
      ...data.map(row => keys.map(k => `"${row[k] ?? ""}"`).join(","))
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full max-w-none px-12 py-14">
        <h1 className="text-2xl font-bold mb-2 mt-2">Sristi KhedutHaat Report</h1>
        <p className="text-gray-500 mb-8 text-base">View vendor sales and product sales by location</p>
        <div className="flex gap-6 mb-8">
          <button
            className={`px-6 py-2 rounded-lg font-medium text-base transition ${
              activeTab === "vendor"
                ? "bg-blue-600 text-white"
                : "bg-white border border-blue-600 text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("vendor")}
          >
            Vendor Sales by Place
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-medium text-base transition ${
              activeTab === "product"
                ? "bg-blue-600 text-white"
                : "bg-white border border-blue-600 text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab("product")}
          >
            Product Sales by Place
          </button>
        </div>
        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow mb-10 p-8 w-full">
          <h3 className="text-lg font-semibold mb-6">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                className="border rounded-xl px-4 py-3 w-full bg-gray-100 text-sm"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {locationOptions.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <select
                className="border rounded-xl px-4 py-3 w-full bg-gray-100 text-sm"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
              >
                <option value="">All Products</option>
                {nameOptions.map((name, idx) => (
                  <option key={idx} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="border rounded-xl px-4 py-3 w-full bg-gray-100 text-sm"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                className="border rounded-xl px-4 py-3 w-full bg-gray-100 text-sm"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>
        </div>
        {/* Download Button */}
        <div className="flex justify-end mb-4">
          {activeTab === "vendor" ? (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition"
              onClick={() => downloadCSV(filteredVendorSales, "vendor_sales.csv")}
              disabled={filteredVendorSales.length === 0}
            >
              Download Vendor Sales CSV
            </button>
          ) : (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-lg transition"
              onClick={() => downloadCSV(filteredProductSales, "product_sales.csv")}
              disabled={filteredProductSales.length === 0}
            >
              Download Product Sales CSV
            </button>
          )}
        </div>
        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow p-8 w-full">
          {activeTab === "vendor" ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Vendor</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Place</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Product</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Quantity Sold</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendorSales.length > 0 ? (
                    filteredVendorSales.map((row: any, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="px-6 py-4 text-sm">{row.vendorName}</td>
                        <td className="px-6 py-4 text-sm">{row.placeName}</td>
                        <td className="px-6 py-4 text-sm">{row.productName}</td>
                        <td className="px-6 py-4 text-sm">{row.quantity}</td>
                        <td className="px-6 py-4 text-sm">{row.date ? formatDate(row.date) : ""}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-400 text-sm">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Place</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Product</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Total Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductSales.length > 0 ? (
                    filteredProductSales.map((row: any, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="px-6 py-4 text-sm">{row.placeName}</td>
                        <td className="px-6 py-4 text-sm">{row.productName}</td>
                        <td className="px-6 py-4 text-sm">{row.totalSold}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-400 text-sm">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReport;