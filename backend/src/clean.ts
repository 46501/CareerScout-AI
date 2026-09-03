import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LanguageDetect from 'languagedetect';
import Opportunity from './models/Opportunity';

dotenv.config();

const cleanDB = async () => {
  const lngDetector = new LanguageDetect();
  let deleted = 0;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to DB');
    
    const opps = await Opportunity.find({});
    for (const opp of opps) {
      const text = `${opp.title} ${opp.description || ''}`.substring(0, 1000);
      if (text.trim().length > 20) {
        const detected = lngDetector.detect(text, 1);
        if (detected && detected.length > 0) {
          const firstMatch = detected[0];
          if (firstMatch && firstMatch.length > 0) {
            const topLanguage = firstMatch[0];
            const rejectedLangs = ['german', 'french', 'spanish', 'dutch', 'italian', 'portuguese', 'polish'];
            
            if (rejectedLangs.includes(topLanguage as string)) {
              console.log(`Deleting ${opp.title} (${topLanguage})`);
              await Opportunity.findByIdAndDelete(opp._id);
              deleted++;
            }
          }
        }
      }
    }
    
    console.log(`Successfully deleted ${deleted} foreign opportunities.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

cleanDB();
