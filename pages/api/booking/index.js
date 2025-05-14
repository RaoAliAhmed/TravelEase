import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { db } = await connectToDatabase();
  const users = await db.collection('users').find({}, { projection: { name: 1, email: 1, bookings: 1 } }).toArray();

  const allBookings = [];
  users.forEach(user => {
    (user.bookings || []).forEach(booking => {
      allBookings.push({
        ...booking,
        userName: user.name,
        userEmail: user.email,
      });
    });
  });


  allBookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

  res.status(200).json({ bookings: allBookings });
}
