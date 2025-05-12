import React, { useState } from 'react';
import { useRouter } from 'next/router';

const colorMap = {
  blue: {
    input: 'focus:ring-blue-500 focus:border-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  pink: {
    input: 'focus:ring-pink-500 focus:border-pink-500',
    button: 'bg-pink-600 hover:bg-pink-700'
  },
  green: {
    input: 'focus:ring-green-500 focus:border-green-500',
    button: 'bg-green-600 hover:bg-green-700'
  }
};

export default function BookingForm({
  type,
  color = 'blue',
  onSubmit,
  loading = false,
  passengerCount = 1,
  showClass = false,
  classes = [],
  selectedClass = null,
  onClassChange = null
}) {
  const router = useRouter();
  const colors = colorMap[color] || colorMap.blue;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    specialRequests: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h2>

      {/* Passenger Count Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Number of Passengers:</span>
          <span className="text-lg font-semibold">{passengerCount}</span>
        </div>
        {selectedClass && showClass && (
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium text-gray-700">Selected Class:</span>
            <span className="text-lg font-semibold">{selectedClass.name}</span>
          </div>
        )}
      </div>

      {/* Class Selection (if applicable) */}
      {showClass && classes.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <button
                key={cls.name}
                type="button"
                onClick={() => onClassChange(cls)}
                className={`p-4 rounded-lg border text-left transition ${
                  selectedClass?.name === cls.name
                    ? `${colors.button} text-white border-transparent`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="font-medium">{cls.name}</div>
                <div className="text-sm mt-1">
                  {selectedClass?.name === cls.name ? 'Selected' : `$${cls.price.toFixed(2)}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Passenger Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          />
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            Zip/Postal Code
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            required
            value={formData.zipCode}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows="3"
            value={formData.specialRequests}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.input}`}
          ></textarea>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`${colors.button} text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            'Complete Booking'
          )}
        </button>
      </div>
    </form>
  );
} 