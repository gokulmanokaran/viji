/**
 * Seeder script - run once to create the doctor account
 * Usage: node seeder.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();
  try {
    // Remove existing users
    await User.deleteMany({});

    const username = process.env.DOCTOR_USERNAME || 'doctor';
    const password = process.env.DOCTOR_PASSWORD || 'clinic123';

    const user = await User.create({ username, password });
    console.log(`✅ Doctor account created: ${user.username}`);
    console.log(`   Password: ${password}`);
  } catch (err) {
    console.error('Seeder error:', err.message);
  } finally {
    mongoose.disconnect();
  }
};

seed();
