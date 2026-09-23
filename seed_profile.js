const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  // Find a user or all users
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const users = await User.find({});
  
  if (users.length === 0) {
    console.log('No users found to seed profile for');
    process.exit(0);
  }
  
  const CareerProfile = mongoose.model('CareerProfile', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    personal: Object,
    education: Array,
    skills: Object,
    experience: Array,
    preferences: Object
  }, { strict: false }));

  for (const user of users) {
    await CareerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        personal: { fullName: 'Test User', phone: '1234567890' },
        education: [{ degree: 'BTech', branch: 'CS', university: 'MIT', graduationYear: 2025 }],
        skills: {
          programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
          frameworks: ['React', 'Node.js', 'Express'],
          databases: ['MongoDB', 'PostgreSQL'],
          cloud: ['AWS'],
          otherSkills: ['Git', 'Docker']
        },
        experience: [{ title: 'Intern', company: 'Tech Corp', startDate: new Date(), isInternship: true }],
        preferences: {
          preferredRoles: ['Software Engineer', 'Full Stack Developer', 'Frontend Developer'],
          preferredLocations: ['Remote', 'New York', 'San Francisco'],
          remotePreference: 'ANY',
          jobPreference: true,
          internshipPreference: true
        }
      },
      { upsert: true, new: true }
    );
    
    // Update user status
    await User.findByIdAndUpdate(user._id, { scoutStatus: 'READY' });
    console.log(`Seeded complete profile for ${user.email || 'user'} (${user._id})`);
  }
  
  console.log('Done seeding profiles');
  process.exit(0);
}

seed().catch(console.error);
