import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import api from '../../lib/api';
import { Upload, ChevronRight, ChevronLeft, CheckCircle, Sparkles } from 'lucide-react';

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  headline: z.string().min(5, 'Headline is required'),
  skills: z.string(), // We will split by comma
  preferredLocations: z.string(),
  remotePreference: z.enum(['REMOTE', 'HYBRID', 'ONSITE', 'ANY']),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      remotePreference: 'ANY'
    }
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        headline: data.headline,
        skills: {
          programmingLanguages: data.skills.split(',').map(s => s.trim()),
          frameworks: [],
          tools: []
        },
        preferences: {
          preferredRoles: [],
          preferredLocations: data.preferredLocations.split(',').map(l => l.trim()),
          remotePreference: data.remotePreference,
          jobPreference: true,
          internshipPreference: true
        }
      };

      await api.put('/profile', payload);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save profile', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>

      <Card className="w-full max-w-2xl glass-card text-white relative z-10 border-slate-800/50 shadow-2xl">
        <CardHeader className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">Step {step} of 3</span>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
              {step === 1 && "Basic Information"}
              {step === 2 && "Skills & Preferences"}
              {step === 3 && <><Sparkles className="h-6 w-6 text-accent-500" /> Upload Resume</>}
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              {step === 1 && "Let's start with the basics to build your AI-powered career profile."}
              {step === 2 && "Tell us what you're good at and what you're looking for."}
              {step === 3 && "Let our AI analyze your resume to auto-fill the rest of your profile."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            
            <div className="transition-all duration-300 min-h-[280px]">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Full Name</label>
                    <Input {...register('fullName')} placeholder="John Doe" className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary-500 focus:ring-primary-500/20 h-12" />
                    {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Professional Headline</label>
                    <Input {...register('headline')} placeholder="e.g. Full Stack Developer | Computer Science Student" className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary-500 focus:ring-primary-500/20 h-12" />
                    {errors.headline && <p className="text-red-400 text-sm">{errors.headline.message}</p>}
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Key Skills <span className="text-slate-500 font-normal">(comma separated)</span></label>
                    <Input {...register('skills')} placeholder="JavaScript, React, Python, TensorFlow" className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary-500 focus:ring-primary-500/20 h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Preferred Locations <span className="text-slate-500 font-normal">(comma separated)</span></label>
                    <Input {...register('preferredLocations')} placeholder="San Francisco, New York, London" className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-primary-500 focus:ring-primary-500/20 h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Remote Preference</label>
                    <select 
                      {...register('remotePreference')}
                      className="flex h-12 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 transition-colors"
                    >
                      <option value="ANY" className="bg-slate-900">Open to Any</option>
                      <option value="REMOTE" className="bg-slate-900">Remote Only</option>
                      <option value="HYBRID" className="bg-slate-900">Hybrid</option>
                      <option value="ONSITE" className="bg-slate-900">On-site Only</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 hover:bg-slate-800/30 hover:border-primary-500/50 transition-all duration-300 cursor-pointer group">
                    <div className="bg-slate-900 p-4 rounded-full inline-block mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
                      <Upload className="h-10 w-10 text-primary-400" />
                    </div>
                    <p className="text-base font-medium text-slate-200 mb-2">Click to upload or drag and drop your resume</p>
                    <p className="text-sm text-slate-500">PDF or DOCX up to 5MB</p>
                    <Button variant="outline" className="mt-6 border-slate-700 hover:bg-slate-800 text-white" type="button">Browse Files</Button>
                  </div>
                  <div className="bg-primary-900/20 border border-primary-500/30 rounded-xl p-4 flex items-start text-left backdrop-blur-sm">
                    <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-primary-100/80 leading-relaxed">
                      Our intelligent parser will analyze your resume to automatically extract your education, work experience, and projects. You can review and edit everything on your dashboard later.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex justify-between pt-6 border-t border-slate-800/50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={step === 1}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent h-12 px-6"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="bg-white text-slate-900 hover:bg-slate-200 h-12 px-8 font-semibold shadow-lg hover:shadow-xl transition-all">
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="bg-primary-600 hover:bg-primary-500 text-white h-12 px-8 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all">
                  {isSubmitting ? 'Analyzing Resume...' : 'Complete Profile'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
