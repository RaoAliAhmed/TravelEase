import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();
    const tripsCollection = db.collection('trips');

    switch (method) {
      case 'GET':
       
        const trips = await tripsCollection.find({}).toArray();
        return res.status(200).json(trips);
      
      case 'POST':
   
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user?.isAdmin) {
          return res.status(401).json({ message: 'Unauthorized - Admin access required' });
        }
        
 
        const tripData = { ...req.body };
        
       
        const requiredFields = ['name', 'origin', 'destination', 'price'];
        for (const field of requiredFields) {
          if (!tripData[field]) {
            return res.status(400).json({ message: `Missing required field: ${field}` });
          }
        }
        

        if (typeof tripData.price === 'string') {
          tripData.price = parseFloat(tripData.price);
        }
        
 
        if (tripData.startDate && typeof tripData.startDate === 'string') {
          tripData.startDate = new Date(tripData.startDate);
        }
        
        if (tripData.endDate && typeof tripData.endDate === 'string') {
          tripData.endDate = new Date(tripData.endDate);
        }
        
      
        tripData.createdAt = new Date();
        
        const result = await tripsCollection.insertOne(tripData);
        
        return res.status(201).json({
          message: 'Trip created successfully',
          trip: { _id: result.insertedId, ...tripData }
        });
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in trips API:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
} 