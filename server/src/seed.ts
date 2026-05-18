import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { Lead } from './models/lead.model.js';
import { User } from './models/user.model.js';

const leads = [
  ['Rahul Sharma', 'rahul.sharma@example.com', 'Qualified', 'Instagram'],
  ['Asha Mehta', 'asha.mehta@example.com', 'Contacted', 'Website'],
  ['Karan Patel', 'karan.patel@example.com', 'New', 'Referral'],
  ['Priya Nair', 'priya.nair@example.com', 'Lost', 'Instagram'],
  ['Neha Rao', 'neha.rao@example.com', 'Qualified', 'Website'],
  ['Arjun Singh', 'arjun.singh@example.com', 'Contacted', 'Referral'],
  ['Sneha Iyer', 'sneha.iyer@example.com', 'New', 'Instagram'],
  ['Vikram Jain', 'vikram.jain@example.com', 'Qualified', 'Website'],
  ['Meera Kapoor', 'meera.kapoor@example.com', 'Lost', 'Referral'],
  ['Rohan Das', 'rohan.das@example.com', 'New', 'Website'],
  ['Ananya Bose', 'ananya.bose@example.com', 'Contacted', 'Instagram'],
  ['Dev Malhotra', 'dev.malhotra@example.com', 'Qualified', 'Referral'],
] as const;

const run = async (): Promise<void> => {
  await connectDb();
  await Promise.all([User.deleteMany({}), Lead.deleteMany({})]);

  const [admin, sales] = await User.create([
    {
      name: 'Admin User',
      email: 'admin@smartleads.dev',
      password: 'Password123',
      role: 'admin',
    },
    {
      name: 'Sales User',
      email: 'sales@smartleads.dev',
      password: 'Password123',
      role: 'sales',
    },
  ]);

  if (!admin || !sales) {
    throw new Error('Failed to create seed users');
  }

  await Lead.create(
    leads.map(([name, email, status, source], index) => ({
      name,
      email,
      status,
      source,
      owner: index % 2 === 0 ? admin._id : sales._id,
    }))
  );

  console.log('Seeded demo users and leads');
  await mongoose.disconnect();
};

void run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
