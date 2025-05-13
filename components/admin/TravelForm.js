import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function Input({ label, name, type = 'text', value, onChange, ...rest }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        className="block w-full rounded-md border-gray-300 px-4 py-2 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...rest}
      />
    </div>
  );
}

export default function TravelForm({ type, initialData, onSubmit, isEditMode = false }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', price: '', seats: '', origin: '', destination: '',
    startDate: '', startTime: '', endDate: '', endTime: '',
    image: '', description: '', flightNumber: '', airline: '', duration: '',
    busNumber: '', busType: '', amenities: '', features: '',
    tripType: '', accommodation: '', activities: '', availableSpots: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && initialData) {
      const formatted = { ...initialData };
      if (formatted.startDate?.includes('T')) {
        const [d, t] = formatted.startDate.split('T');
        formatted.startDate = d;
        formatted.startTime = t?.substring(0, 5);
        }
      if (formatted.endDate?.includes('T')) {
        const [d, t] = formatted.endDate.split('T');
        formatted.endDate = d;
        formatted.endTime = t?.substring(0, 5);
      }
      ['features', 'amenities', 'activities'].forEach(k => {
        if (Array.isArray(formatted[k])) formatted[k] = formatted[k].join(', ');
      });
      setFormData(prev => ({ ...prev, ...formatted }));
      setInitialized(true);
    }
  }, [initialData, initialized]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const required = ['name', 'price', 'origin', 'destination'];
    for (let field of required) {
      if (!formData[field]) {
        setError(`Field "${field}" is required.`);
      setLoading(false);
      return;
    }
    }

    const payload = { ...formData };
    payload.price = parseFloat(payload.price);
    payload.duration = Number(payload.duration);
    payload.seats = Number(payload.seats);
    payload.availableSpots = Number(payload.availableSpots);

    ['features', 'amenities', 'activities'].forEach(k => {
      if (typeof payload[k] === 'string') {
        payload[k] = payload[k].split(',').map(x => x.trim()).filter(Boolean);
    }
    });

    if (payload.startDate && payload.startTime) {
      const d = new Date(`${payload.startDate}T${payload.startTime}`);
      payload.startDate = isNaN(d) ? null : d.toISOString();
    }
    if (payload.endDate && payload.endTime) {
      const d = new Date(`${payload.endDate}T${payload.endTime}`);
      payload.endDate = isNaN(d) ? null : d.toISOString();
    }

    delete payload.startTime;
    delete payload.endTime;
    delete payload._id;

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {isEditMode ? `Edit ${type}` : `Create ${type}`}
      </h2>
      {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <Input label="Name*" name="name" value={formData.name} onChange={handleChange} required />
        <Input label="Price (USD)*" name="price" type="text" value={formData.price} onChange={handleChange} required />
        <Input label="Seats*" name="seats" type="text" value={formData.seats} onChange={handleChange} required />
        <Input label="Origin*" name="origin" value={formData.origin} onChange={handleChange} required />
        <Input label="Destination*" name="destination" value={formData.destination} onChange={handleChange} required />
        <Input label="Image URL" name="image" type="url" value={formData.image} onChange={handleChange} />
        <Input label="Description" name="description" value={formData.description} onChange={handleChange} className="md:col-span-2" />
        <Input label="Departure Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
        <Input label="Departure Time" name="startTime" type="time" value={formData.startTime} onChange={handleChange} />
        <Input label="Arrival Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
        <Input label="Arrival Time" name="endTime" type="time" value={formData.endTime} onChange={handleChange} />

        {type === 'flight' && <>
          <Input label="Flight Number" name="flightNumber" value={formData.flightNumber} onChange={handleChange} />
          <Input label="Airline" name="airline" value={formData.airline} onChange={handleChange} />
          <Input label="Duration (minutes)" name="duration" type="text" value={formData.duration} onChange={handleChange} />
          <Input label="Features (comma-separated)" name="features" value={formData.features} onChange={handleChange} className="md:col-span-2" />
        </>}

        {type === 'bus' && <>
          <Input label="Bus Number" name="busNumber" value={formData.busNumber} onChange={handleChange} />
          <Input label="Bus Type" name="busType" value={formData.busType} onChange={handleChange} />
          <Input label="Duration (minutes)" name="duration" type="text" value={formData.duration} onChange={handleChange} />
          <Input label="Amenities (comma-separated)" name="amenities" value={formData.amenities} onChange={handleChange} className="md:col-span-2" />
        </>}

        {type === 'trip' && <>
          <Input label="Trip Type" name="tripType" value={formData.tripType} onChange={handleChange} />
          <Input label="Accommodation" name="accommodation" value={formData.accommodation} onChange={handleChange} />
          <Input label="Duration (days)" name="duration" type="text" value={formData.duration} onChange={handleChange} />
          <Input label="Available Spots" name="availableSpots" type="text" value={formData.availableSpots} onChange={handleChange} />
          <Input label="Activities (comma-separated)" name="activities" value={formData.activities} onChange={handleChange} className="md:col-span-2" />
        </>}

        <div className="md:col-span-2 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >Cancel</button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >{loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
} 