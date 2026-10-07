import { Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { SavedOpportunity } from '../models/SavedOpportunity';
import { Opportunity } from '../models/Opportunity';
import { UserOpportunityMatch } from '../models/UserOpportunityMatch';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    // Get total saved opportunities
    const saved = await SavedOpportunity.countDocuments({ user: userId });

    // Get application stats
    const applications = await Application.find({ user: userId });
    const applied = applications.length;
    const interviews = applications.filter(a => a.status === 'INTERVIEW').length;
    const shortlisted = applications.filter(a => a.status === 'ONLINE_ASSESSMENT' || a.status === 'OFFER' || a.status === 'INTERVIEW').length;

    res.status(200).json({
      success: true,
      data: {
        saved,
        applied,
        interviews,
        shortlisted
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    // Fetch opportunities that matched this user
    const matches = await UserOpportunityMatch.find({ userId }).populate('opportunityId');

    // Aggregate trends by month based on postedAt of the matched opportunities
    // This is a simplified version, ideally you'd use a MongoDB aggregation pipeline
    // For now, we will just generate stats for the last 6 months based on matches

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Generate the last 6 months labels
    const chartData: Array<{name: string, monthIndex: number, Jobs: number, Internships: number, Competitions: number, Hackathons: number}> = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      if (m < 0) m += 12;
      chartData.push({
        name: months[m],
        monthIndex: m,
        Jobs: 0,
        Internships: 0,
        Competitions: 0,
        Hackathons: 0
      });
    }

    matches.forEach(match => {
      const opp = match.opportunityId as any;
      if (!opp || !opp.postedAt) return;
      const date = new Date(opp.postedAt);
      const mIndex = date.getMonth();
      const monthData = chartData.find(d => d.monthIndex === mIndex);
      
      if (monthData) {
        if (opp.type === 'Job') monthData.Jobs++;
        else if (opp.type === 'Internship') monthData.Internships++;
        else if (opp.type === 'Competition') monthData.Competitions++;
        else if (opp.type === 'Hackathon') monthData.Hackathons++;
      }
    });

    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    // Find all opportunities matched for this user
    const matches = await UserOpportunityMatch.find({ userId }).populate('opportunityId');
    
    const skillCounts: Record<string, number> = {};
    let totalOpportunities = 0;

    matches.forEach(match => {
      const opp = match.opportunityId as any;
      if (!opp || !opp.skills) return;
      totalOpportunities++;
      opp.skills.forEach((skill: string) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Calculate percentages
    const skillsArray = Object.entries(skillCounts)
      .map(([name, count]) => ({
        name,
        percent: totalOpportunities > 0 ? Math.round((count / totalOpportunities) * 100) : 0
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 6);

    res.status(200).json({ success: true, data: skillsArray });
  } catch (error) {
    next(error);
  }
};
