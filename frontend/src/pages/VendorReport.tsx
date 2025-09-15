import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Layout/Navbar";
import { reportAPI } from "../services/api";

// Utility to download filtered data as CSV
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

const VendorReport: React.FC = () => {
  const vendorId = useSelector((state: any) => state.auth.user?._id);

  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [placeFilter, setPlaceFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  useEffect(() => {
    if (!vendorId) return;
    reportAPI.getVendorSpecificSales({ vendorId, startDate, endDate })
      .then(setSales)
      .catch(console.error);
  }, [vendorId, startDate, endDate]);

  // Unique places and products for dropdowns
  const placeOptions = useMemo(() => (
    Array.from(new Set(sales.map((row: any) => row.placeName))).filter(Boolean)
  ), [sales]);

  const productOptions = useMemo(() => (
    Array.from(new Set(sales.map((row: any) => row.productName))).filter(Boolean)
  ), [sales]);

  // Filtered sales
  const filteredSales = sales.filter((row: any) =>
    (placeFilter === "" || row.placeName === placeFilter) &&
    (productFilter === "" || row.productName === productFilter)
  );

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Navbar />
      <div className="w-full px-12 py-14">
        <h1 className="text-2xl font-bold mb-2 mt-2">My Sales Report</h1>
        <p className="text-gray-500 mb-8 text-base">See your product sales by place and date</p>
        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow mb-10 p-8 w-full">
          <h3 className="text-lg font-semibold mb-6">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Place</label>
              <select
                className="border rounded-xl px-4 py-3 w-full bg-gray-100 text-sm"
                value={placeFilter}
                onChange={e => setPlaceFilter(e.target.value)}
              >
                <option value="">All Places</option>
                {placeOptions.map((place, idx) => (
                  <option key={idx} value={place}>{place}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <select
                className="border rounded-xl px-4 py-3 w-full bg-gray-100 text-sm"
                value={productFilter}
                onChange={e => setProductFilter(e.target.value)}
              >
                <option value="">All Products</option>
                {productOptions.map((prod, idx) => (
                  <option key={idx} value={prod}>{prod}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                className="border rounded-xl px-4 py-3 w-full bg-gray-100 text-sm"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
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
        <div className="flex justify-end mb-4 w-full">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition"
            onClick={() => downloadCSV(filteredSales, "vendor_sales.csv")}
            disabled={filteredSales.length === 0}
          >
            Download CSV
          </button>
        </div>
        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow p-8 w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Place</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Product</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Quantity Sold</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700 text-base">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((row: any, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="px-6 py-4 text-sm">{row.placeName}</td>
                      <td className="px-6 py-4 text-sm">{row.productName}</td>
                      <td className="px-6 py-4 text-sm">{row.quantity}</td>
                      <td className="px-6 py-4 text-sm">{row.date ? new Date(row.date).toLocaleDateString() : ""}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-400 text-sm">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorReport;