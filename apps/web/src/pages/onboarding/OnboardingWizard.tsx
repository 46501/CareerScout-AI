import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import api from '../../lib/api';
import { Upload, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-2 w-12 rounded-full ${step >= i ? 'bg-primary-600' : 'bg-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-500">Step {step} of 3</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && "Basic Information"}
            {step === 2 && "Skills & Preferences"}
            {step === 3 && "Upload Resume"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Let's start with the basics to build your career profile."}
            {step === 2 && "Tell us what you're good at and what you're looking for."}
            {step === 3 && "Let our AI analyze your resume to auto-fill the rest."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input {...register('fullName')} placeholder="John Doe" />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline</label>
                  <Input {...register('headline')} placeholder="e.g. Full Stack Developer | Computer Science Student" />
                  {errors.headline && <p className="text-red-500 text-sm mt-1">{errors.headline.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Skills (comma separated)</label>
                  <Input {...register('skills')} placeholder="JavaScript, React, Python" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations (comma separated)</label>
                  <Input {...register('preferredLocations')} placeholder="San Francisco, New York, London" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remote Preference</label>
                  <select 
                    {...register('remotePreference')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <option value="ANY">Open to Any</option>
                    <option value="REMOTE">Remote Only</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site Only</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop your resume</p>
                  <p className="text-xs text-gray-500">PDF or DOCX up to 5MB</p>
                  <Button variant="outline" className="mt-4" type="button">Browse Files</Button>
                </div>
                <div className="bg-primary-50 rounded-lg p-4 flex items-start text-left">
                  <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-primary-800">
                    Our AI will analyze your resume to automatically extract your education, work experience, and projects. You can review and edit everything on your dashboard later.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={step === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {step < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Complete Profile'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
