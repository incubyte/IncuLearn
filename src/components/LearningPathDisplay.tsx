'use client';

interface Resource {
  type: string;
  title: string;
  url?: string;
  description: string;
}

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: string;
}

interface Module {
  title: string;
  description: string;
  resources: Resource[];
  assessment?: {
    questions: Question[];
  };
}

interface Course {
  _id?: string;
  title: string;
  description: string;
  currentLevel: string;
  targetSkill: string;
  learningPath: {
    modules: Module[];
  };
}

interface LearningPathDisplayProps {
  course: Course | null;
}

export default function LearningPathDisplay({ course }: LearningPathDisplayProps) {
  if (!course) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <p className="text-gray-500 italic">
            Chat with our AI to generate your personalized learning path. It will appear here once created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-medium text-gray-900">Your Learning Path</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
          <p className="text-gray-600 mt-1">{course.description}</p>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              Level: {course.currentLevel}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Skill: {course.targetSkill}
            </span>
          </div>
        </div>
        
        <div className="space-y-6">
          {course.learningPath.modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="border border-gray-200 rounded-md p-4">
              <h4 className="text-md font-medium text-gray-900">
                Module {moduleIndex + 1}: {module.title}
              </h4>
              <p className="text-gray-600 mt-1 text-sm">{module.description}</p>
              
              <h5 className="text-sm font-medium text-gray-900 mt-3 mb-2">Resources:</h5>
              <ul className="space-y-2">
                {module.resources.map((resource, resourceIndex) => (
                  <li key={resourceIndex} className="text-sm">
                    <div className="font-medium">{resource.title}</div>
                    <div className="text-gray-500 text-xs">{resource.type}</div>
                    <div className="text-gray-600">{resource.description}</div>
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900 text-xs"
                      >
                        View Resource
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              
              {module.assessment && module.assessment.questions.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Assessment:</h5>
                  <div className="space-y-2">
                    {module.assessment.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="text-sm">
                        <div className="font-medium">{question.question}</div>
                        {question.options && (
                          <ul className="ml-4 mt-1 space-y-1">
                            {question.options.map((option, optionIndex) => (
                              <li key={optionIndex} className="text-gray-600">
                                {option}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}