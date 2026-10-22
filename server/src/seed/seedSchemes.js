require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');
const User = require('../models/User');
const schemesData = require('./schemesData');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scheme_recommender');
    console.log('Connected to MongoDB');

    await Scheme.deleteMany({});
    const inserted = await Scheme.insertMany(schemesData);
    console.log(`Seeded ${inserted.length} schemes`);

    const adminEmail = 'admin@schemes.gov';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        profile: {
          fullName: 'System Admin',
          age: 30,
          gender: 'other',
          category: 'general',
          annualIncome: 500000,
          occupation: 'salaried',
          education: 'postgraduate',
          state: 'Delhi',
          areaType: 'urban',
        },
        profileComplete: true,
      });
      console.log('Created admin user: admin@schemes.gov / admin123');
    } else {
      console.log('Admin user already exists');
    }

    const demoEmail = 'citizen@demo.com';
    let demo = await User.findOne({ email: demoEmail });
    if (!demo) {
      demo = await User.create({
        name: 'Demo Citizen',
        email: demoEmail,
        password: 'demo123',
        role: 'citizen',
        profile: {
          fullName: 'Ravi Kumar',
          age: 24,
          gender: 'male',
          category: 'obc',
          annualIncome: 180000,
          occupation: 'unemployed',
          education: 'graduate',
          state: 'Uttar Pradesh',
          areaType: 'rural',
          maritalStatus: 'single',
          disability: false,
          isBPL: true,
          hasBankAccount: true,
          aadhaarLinked: true,
        },
        profileComplete: true,
      });
      console.log('Created demo citizen: citizen@demo.com / demo123');
    } else {
      console.log('Demo citizen already exists');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
