# Labyrinth - AI-Powered Exam Management System

A modern, AI-enhanced examination management platform with intelligent PDF question extraction capabilities.

## 🚀 Features

### Core Features
- **Session Management**: Create and manage examination sessions
- **Class Organization**: Organize classes within sessions
- **Exam Creation**: Build comprehensive examinations
- **Question Bank**: Manage questions with multiple formats
- **Real-time Dashboard**: Beautiful, interactive dashboard with statistics

### AI-Powered Features
- **PDF Question Extraction**: Upload PDF question papers and automatically extract questions
- **Smart Text Analysis**: AI-powered question and option detection
- **Multiple Choice Recognition**: Automatic identification of A, B, C, D options
- **Fallback Processing**: Regex-based extraction when AI is unavailable

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Dropzone** for file uploads
- **Modern CSS** with glassmorphism effects
- **Interactive animations** and pointer-responsive elements

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PDF-Parse** for text extraction
- **OpenAI GPT-3.5** for intelligent question extraction
- **Multer** for file upload handling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for AI features)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file with the following variables:
   PORT=5000
   NODE_ENV=development
   OPENAI_API_KEY=your-openai-api-key-here
   MONGODB_URI=mongodb://localhost:27017/labyrinth
   JWT_SECRET=your-jwt-secret-here
   CLIENT_URL=http://localhost:3001
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## 🎯 How to Use PDF Question Extraction

### Step 1: Access Questions Section
1. Log in to the admin panel
2. Navigate to Sessions → Classes → Exams → Questions
3. Click the "📄 Upload PDF" button

### Step 2: Upload PDF
1. Drag and drop your PDF question paper or click to browse
2. The system will automatically process the PDF
3. AI will extract questions and options

### Step 3: Review and Edit
1. Review the extracted questions
2. Edit question text, options, or correct answers if needed
3. Set the correct answer for each question

### Step 4: Import Questions
1. Click "Import Questions" to add them to your exam
2. Questions will be automatically added to the question bank

## 🔧 Configuration

### OpenAI API Setup
1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add it to your `.env` file as `OPENAI_API_KEY`
3. The system will use GPT-3.5-turbo for question extraction

### PDF Processing
- **File Size Limit**: 10MB maximum
- **Supported Format**: PDF only
- **Text Extraction**: Works with both typed and scanned PDFs
- **Question Types**: Multiple choice questions (A, B, C, D format)

## 🎨 UI Features

### Interactive Elements
- **Pointer-responsive bubbles**: Background elements follow your mouse
- **Gravity effects**: Cards and elements respond to pointer proximity
- **Smooth animations**: 60fps animations with requestAnimationFrame
- **Glassmorphism design**: Modern, translucent UI elements

### Responsive Design
- **Mobile-friendly**: Works on all screen sizes
- **Touch support**: Optimized for touch devices
- **Dark/Light themes**: Automatic theme switching

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the TypeScript code: `npm run build`
3. Start production server: `npm start`

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting service

## 🔒 Security Features

- **File validation**: Only PDF files accepted
- **Size limits**: 10MB maximum file size
- **Input sanitization**: All user inputs are validated
- **CORS protection**: Configured for secure cross-origin requests

## 🐛 Troubleshooting

### Common Issues

1. **PDF not processing**
   - Ensure the PDF contains text (not just images)
   - Check file size is under 10MB
   - Verify OpenAI API key is valid

2. **Questions not extracting properly**
   - Ensure questions follow standard format (1. Question text)
   - Options should be labeled A, B, C, D
   - Check PDF text quality

3. **Backend connection issues**
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Ensure all environment variables are set

## 📝 API Endpoints

### PDF Processing
- `POST /api/questions/upload-pdf` - Upload and process PDF

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Labyrinth** - Making exam creation effortless with AI! 🎓✨ 