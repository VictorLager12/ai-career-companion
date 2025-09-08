import React from 'react'

const questionList = [
  'What skills do I need for software development?',
  'How do I switch careers to UX design?' 
]

function EmptyState({selectedQuestion}: {selectedQuestion: (question: string) => void}) {
  return (
    <div>
      <h2 className='font-bold text-xl text-center'>Ask AI Career Companion anything</h2>
      <div>
        {questionList.map((question, index) => (
          <h2 
            className='p-4 text-center border rounded-lg my-3 hover:border-primary cursor-pointer'
            key={index} 
            onClick={() => selectedQuestion(question)}
          >
            {question}
          </h2>
        ))}
      </div>
    </div>
  )
}

export default EmptyState