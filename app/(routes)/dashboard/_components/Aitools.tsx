import React from 'react'
import AiToolCard from './AiToolCard'

export const aiToolsList = [
  {
    name: 'AI Career Q&A Chat',
    desc: 'Chat instantly with your AI career companion to explore jobs, skills, and trends.',
    icon: '/q&a.png',
    button: 'Start Chatting',
    path: '/ai-tools/ai-chat',
  },
  {
    name: 'AI Resume Analyzer',
    desc: 'Upload your resume and receive actionable AI-powered insights and improvements.',
    icon: '/resume_ana.png',
    button: 'Analyze Resume',
    path: '/ai-tools/ai-resume-analyzer',
  },
]

function Aitools() {
  return (
    <div className="mt-10 p-8 bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-200 rounded-2xl shadow-md">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="font-extrabold text-2xl md:text-3xl text-gray-800 mb-2">
          Explore Our AI-Powered Tools
        </h2>
        <p className="text-gray-600 text-base md:text-lg">
          Unlock a suite of smart assistants designed to streamline your career journey and boost productivity.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-8 mt-8 ml-6 mr-6">
        {aiToolsList.map((tool: any, index) => (
          <AiToolCard tool={tool} key={index} />
        ))}
      </div>
    </div>
  )
}

export default Aitools
