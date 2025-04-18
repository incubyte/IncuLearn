# IncuLearn

IncuLearn is an AI-powered personalized learning platform that creates custom learning paths based on a user's current skill level and learning goals.

## Features

- **Personalized Learning Paths**: AI-generated custom learning plans tailored to your needs
- **Interactive Chat Interface**: Communicate with AI to define your learning objectives
- **Assessments & Feedback**: Track your progress with integrated assessments
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI API (o3-mini model)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB running locally or a MongoDB Atlas account
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/inculearn.git
   cd inculearn
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
inculearn/
├── src/
│   ├── app/             # Next.js app router
│   │   ├── api/         # API routes
│   │   ├── course-creation/ # Course creation page
│   │   ├── my-courses/  # My courses page
│   │   └── feedbacks/   # Feedback page
│   ├── components/      # React components
│   ├── lib/             # Utility functions
│   ├── models/          # MongoDB models
│   ├── services/        # Service layer
│   └── types/           # TypeScript types
├── public/              # Static assets
└── ...config files
```

## Main Pages

- `/course-creation`: Create personalized learning paths with AI assistance
- `/my-courses`: View and manage your created courses
- `/feedbacks`: View feedback and assessment results

## Future Enhancements

- User authentication and authorization
- Progress tracking and analytics
- Social features for collaborative learning
- Mobile app integration
