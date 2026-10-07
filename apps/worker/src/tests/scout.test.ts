import { runPersonalizedScout } from '../services/scout.service';
import { User } from '../../../api/src/models/User';
import { CareerProfile } from '../../../api/src/models/CareerProfile';
import { Opportunity } from '../../../api/src/models/Opportunity';
import { UserOpportunityMatch } from '../../../api/src/models/UserOpportunityMatch';

jest.mock('../providers/RemotiveProvider', () => {
  return {
    RemotiveProvider: jest.fn().mockImplementation(() => {
      return {
        fetchOpportunities: jest.fn().mockResolvedValue([
          {
            title: 'Frontend Developer',
            organization: 'TestCo',
            location: 'Remote',
            type: 'JOB',
            description: 'Looking for React developer',
            remoteType: 'REMOTE',
            source: 'Remotive',
            sourceId: '123',
            sourceUrl: 'http://test.com',
            isActive: true,
            skills: ['React', 'TypeScript']
          }
        ])
      };
    })
  };
});

describe('Scout Service Tests', () => {
  it('should run scout successfully and save matches', async () => {
    const user = await User.create({
      fullName: 'Scout Test User',
      email: 'scout@test.com',
      passwordHash: 'hashedpassword',
    });

    await CareerProfile.create({
      userId: user._id,
      careerGoals: { targetRoles: ['Frontend Developer'] },
      locationPreferences: { workPreference: ['REMOTE'] },
      skills: { webDevelopment: [{name: 'React'}, {name: 'TypeScript'}] }
    });

    await Opportunity.create({
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'JOB',
      isActive: true,
      remoteType: 'REMOTE',
      skills: ['React', 'TypeScript'],
      lastVerifiedAt: new Date(),
      applicationUrl: 'http://test.com',
      sourceUrl: 'http://test.com',
      postedAt: new Date(),
      sourceId: 'src-123',
      source: 'Remotive',
      description: 'A great frontend role.',
      organization: 'Tech Corp'
    });

    await runPersonalizedScout(user._id.toString());

    const opps = await Opportunity.find({});
    expect(opps.length).toBe(1);
    expect(opps[0].title).toBe('Frontend Developer');

    const matches = await UserOpportunityMatch.find({ userId: user._id });
    expect(matches.length).toBe(1);
    expect(matches[0].matchScore).toBeGreaterThan(0);
    expect(matches[0].matchReasons.length).toBeGreaterThan(0);
  }, 30000);
});
