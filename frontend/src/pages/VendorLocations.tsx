"use client"

import { useState, useEffect } from "react"
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react'

interface Location {
  _id: string
  name: string
  address: string
  isActive: boolean
}

const VendorLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: ""
  })

  // Mock data for demonstration
  const mockLocations: Location[] = [
    { _id: "1", name: "Delhi", address: "Central Delhi Market", isActive: false },
    { _id: "2", name: "Mumbai", address: "Crawford Market", isActive: false },
    { _id: "3", name: "Bangalore", address: "KR Market", isActive: false },
    { _id: "4", name: "Chennai", address: "Koyambedu Market", isActive: true },
    { _id: "5", name: "Kolkata", address: "Burrabazar Market", isActive: true }
  ]

  useEffect(() => {
    setLocations(mockLocations)
  }, [])

  const handleAddLocation = () => {
    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      alert("Please fill in all fields")
      return
    }

    const location: Location = {
      _id: Date.now().toString(),
      name: newLocation.name,
      address: newLocation.address,
      isActive: true
    }

    setLocations([...locations, location])
    setNewLocation({ name: "", address: "" })
    setShowAddForm(false)
  }

  const toggleLocationStatus = (locationId: string) => {
    setLocations(locations.map(location => 
      location._id === locationId 
        ? { ...location, isActive: !location.isActive }
        : location
    ))
  }

  const deleteLocation = (locationId: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      setLocations(locations.filter(location => location._id !== locationId))
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        <p className="text-gray-600 mt-1">Manage your available locations for daily activities</p>
      </div>

      {/* Add New Location */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Location</h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showAddForm ? "Cancel" : "Add Location"}
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">Add a new location to your available options</p>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
              <input
                type="text"
                value={newLocation.name}
                onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                placeholder="Enter location name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={newLocation.address}
                onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                placeholder="Enter address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAddLocation}
              className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Location
            </button>
          </div>
        )}
      </div>

      {/* Your Locations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your Locations</h2>
          </div>
          <p className="text-gray-600 text-sm mt-1">Manage all your available locations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {locations.map((location) => (
            <div key={location._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(location.isActive)}`}></div>
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{location.address}</p>
              
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm">
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => toggleLocationStatus(location._id)}
                  className={`px-3 py-1 text-xs rounded ${
                    location.isActive
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {location.isActive ? "Deactivate" : "Activate"}
                </button>
                
                <button
                  onClick={() => deleteLocation(location._id)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {locations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No locations added yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorLocations
