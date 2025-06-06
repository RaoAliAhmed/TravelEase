import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId, ReturnDocument } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  try {
    const { db } = await connectToDatabase();
    const busesCollection = db.collection('buses');

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid bus ID' });
    }

    const objectId = new ObjectId(id);

    switch (method) {
      case 'GET': {
        const bus = await busesCollection.findOne({ _id: objectId });
        if (!bus) {
          return res.status(404).json({ message: 'Bus not found' });
        }
        return res.status(200).json(bus);
      }

      case 'PUT': {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user?.isAdmin) {
          return res.status(401).json({ message: 'Unauthorized - Admin access required' });
        }

          const updateData = { ...req.body };
        
        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
        if (updateData.price) updateData.price = Number(updateData.price);
        

          const updatedBus = await busesCollection.findOneAndUpdate(
          { _id: objectId },
          { $set: updateData },
          { returnDocument: 'after' } // Fallback for older MongoDB drivers
          );
        console.log("updatedBus",updatedBus)

        if (!updatedBus) {
          console.log("updatedBus not found")
          return res.status(404).json({ message: 'Bus not found' });
          }

        return res.status(200).json("Successfully updated");
      }

      case 'DELETE': {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user?.isAdmin) {
          return res.status(401).json({ message: 'Unauthorized - Admin access required' });
        }

        const result = await busesCollection.deleteOne({ _id: objectId });
          if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Bus not found' });
          }

          return res.status(200).json({ message: 'Bus deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
