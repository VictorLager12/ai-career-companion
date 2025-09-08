import ResumeUploadDialog from '@/app/(routes)/dashboard/_components/ResumeUploadDialog';
import { Button } from '@/components/ui/button';
import { Sparkle } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

/**
 * Report component to display AI analysis results.
 */
function Report({ aiReport }: any) {
  const [openResumeUpload, setOpenResumeUpload] = useState(false);

  if (!aiReport) {
    return (
      <div className="bg-gray-50 text-gray-800 h-full flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Generating Analysis...</h1>
          <p className="text-gray-500 mt-2">Please wait a moment while we review your resume. ⏳</p>
        </div>
      </div>
    );
  }

  // Helper functions remain the same
  const getOverallFeedback = (score: number) => {
    if (score >= 80) return { text: 'Excellent!', color: 'text-green-500' };
    if (score >= 60) return { text: 'Good', color: 'text-yellow-500' };
    return { text: 'Needs Improvement', color: 'text-red-500' };
  };
  
  const getSectionStyle = (score: number) => {
    if (score >= 85) return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' };
    if (score >= 60) return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' };
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' };
  };

  const overallFeedbackStyle = getOverallFeedback(aiReport.overall_score);
  const contactStyles = getSectionStyle(aiReport.sections.contact_info.score);
  const experienceStyles = getSectionStyle(aiReport.sections.experience.score);
  const educationStyles = getSectionStyle(aiReport.sections.education.score);
  const skillsStyles = getSectionStyle(aiReport.sections.skills.score);

  return (
    // 1. Use a React Fragment to allow sibling elements at the top level.
    
      <div className="bg-gray-50 text-gray-800">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">AI Analysis Results</h1>
            
           <Button type="button" onClick={() => setOpenResumeUpload(true)}className="bg-teal-600 hover:bg-teal-700 text-white" > Re-analyze <Sparkle />
           </Button>
          </header>

          <main className="space-y-6">
            {/* All report sections are unchanged */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">Overall Score</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-6xl font-extrabold text-indigo-600">{aiReport.overall_score}</span>
                <span className="text-2xl font-bold text-gray-400">/100</span>
                <span className={`ml-auto text-lg font-bold ${overallFeedbackStyle.color}`}>{overallFeedbackStyle.text}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${aiReport.overall_score}%` }}></div>
              </div>
              <p className="text-gray-500 mt-3">{aiReport.summary_comment}</p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className={`${contactStyles.bg} p-6 rounded-2xl shadow-sm border ${contactStyles.border}`}>
                <h3 className="text-md font-semibold text-gray-600">Contact Info</h3>
                <p className={`text-4xl font-bold ${contactStyles.text} mt-2`}>{aiReport.sections.contact_info.score}</p>
                <p className="text-gray-500 text-sm mt-1">{aiReport.sections.contact_info.comment}</p>
              </div>
              <div className={`${experienceStyles.bg} p-6 rounded-2xl shadow-sm border ${experienceStyles.border}`}>
                <h3 className="text-md font-semibold text-gray-600">Experience</h3>
                <p className={`text-4xl font-bold ${experienceStyles.text} mt-2`}>{aiReport.sections.experience.score}</p>
                <p className="text-gray-500 text-sm mt-1">{aiReport.sections.experience.comment}</p>
              </div>
              <div className={`${educationStyles.bg} p-6 rounded-2xl shadow-sm border ${educationStyles.border}`}>
                <h3 className="text-md font-semibold text-gray-600">Education</h3>
                <p className={`text-4xl font-bold ${educationStyles.text} mt-2`}>{aiReport.sections.education.score}</p>
                <p className="text-gray-500 text-sm mt-1">{aiReport.sections.education.comment}</p>
              </div>
              <div className={`${skillsStyles.bg} p-6 rounded-2xl shadow-sm border ${skillsStyles.border}`}>
                <h3 className="text-md font-semibold text-gray-600">Skills</h3>
                <p className={`text-4xl font-bold ${skillsStyles.text} mt-2`}>{aiReport.sections.skills.score}</p>
                <p className="text-gray-500 text-sm mt-1">{aiReport.sections.skills.comment}</p>
              </div>
            </div>

            <section className="bg-gray-100 p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Tips for Improvement</h2>
              <ul className="space-y-3">
                {aiReport.tips_for_improvement.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-3 h-3 bg-indigo-200 rounded-full mt-1.5"></div>
                    <p className="text-gray-600">{tip}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-green-50 border-green-200 p-6 rounded-2xl shadow-sm border">
              <h2 className="text-xl font-bold mb-4 text-green-800">What's Good</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {aiReport.whats_good.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="bg-red-50 border-red-200 p-6 rounded-2xl shadow-sm border">
              <h2 className="text-xl font-bold mb-4 text-red-800">Needs Improvement</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {aiReport.needs_improvement.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg text-center">
              <h2 className="text-3xl font-bold">Ready to refine your resume? 🫰</h2>
              <p className="mt-2 mb-3 max-w-2xl mx-auto">Make your application stand out with our premium insights and features.</p>
              <Link href="/billing" className="mt-8 bg-white text-indigo-600 font-bold px-8 py-3 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300">
                Upgrade to Premium
              </Link>
            </section>
          </main>
        </div>
        {/* 2. Move the Dialog component here, outside the main div */}
      <ResumeUploadDialog 
        openResumeUpload={openResumeUpload} 
        setOpenResumeUpload={()=> setOpenResumeUpload(false)}
      />
      </div>
      
      
    
  );
}

export default Report;