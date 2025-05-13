import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { bookingId, type, itemId, passengers, userEmail } = req.body;
  if (!bookingId || !type || !itemId || !passengers || !userEmail) {
    return res.status(400).json({ message: 'Missing data' });
  }

  const { db } = await connectToDatabase();

  // 1. Increment seats for flight or bus
  if (type === 'flight') {
    await db.collection('flights').updateOne(
      { _id: new ObjectId(itemId) },
      { $inc: { seats: passengers } }
    );
  } else if (type === 'bus') {
    await db.collection('buses').updateOne(
      { _id: new ObjectId(itemId) },
      { $inc: { seats: passengers } }
    );
  }

  // 2. Remove booking from user's bookings array
  await db.collection('users').updateOne(
    { email: userEmail },
    { $pull: { bookings: { bookingId } } }
  );

  res.status(200).json({ success: true });
} 