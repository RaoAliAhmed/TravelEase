import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import TravelForm from '@/components/admin/TravelForm';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default function EditBus({ initialBus }) {
  const router = useRouter();
  const { id, isReady } = router.query;
  const [error, setError] = useState('');
  const [bus, setBus] = useState(initialBus);
  const [loading, setLoading] = useState(!id);

  useEffect(() => {
    console.log("id",id)
    console.log("initialBus",initialBus)
    console.log("isReady",isReady)
    if (!initialBus && id) {
      const fetchBus = async () => {
        try {
          console.log("id in useEffect",id)
          const response = await fetch(`/api/buses/${id}`);
          if (!response.ok) throw new Error('Failed to fetch bus');
          const data = await response.json();
          setBus(data);
        } catch (err) {
          console.error('Error fetching bus:', err);
          setError('Failed to load bus data');
        } finally {
          setLoading(false);
        }
      };
      fetchBus();
    }
  }, [id, initialBus, isReady]);

  const handleSubmit = async (busData) => {
    if (!router.isReady || !router.query.id) {
      
      setError('Bus ID is not available yet. Please wait...');
      return;
    }

    console.log(router.query.id)
    console.log({id})
    try {
      const response = await fetch(`/api/buses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busData),
      });
  
      const result = await response.json();
      console.log("result",result)
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update bus');
      }
  
      router.push('/admin/buses');
    } catch (err) {
      setError(err.message);
      console.error('Update error:', err);
    }
  };
  
  

  if (loading || isReady) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!bus) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">Bus Not Found</h1>
          <button
            onClick={() => router.push('/admin/bus')}
            className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Back to Buses
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Edit Bus | Admin Dashboard</title>
      </Head>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Bus</h1>
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>
        )}
        <TravelForm
          type="bus"
          initialData={bus}
          onSubmit={handleSubmit}
          isEditMode={true}
        />
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return { props: { initialBus: null } };
    }

    const { db } = await connectToDatabase();
    const bus = await db.collection('buses').findOne({ _id: new ObjectId(id) });

    if (!bus) {
      return { props: { initialBus: null } };
    }

    return {
      props: {
        initialBus: JSON.parse(JSON.stringify({
          ...bus,
          _id: bus._id.toString(),
          startDate: bus.startDate ? bus.startDate.toString() : null,
          endDate: bus.endDate ? bus.endDate.toString() : null,
        })),
      },
    };
  } catch (err) {
    console.error('Error loading bus:', err);
    return { props: { initialBus: null } };
  }
}
