import { Request, Response } from 'express';
import multer from 'multer';
import pdf from 'pdf-parse';

// Extend Request type to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
import OpenAI from 'openai';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize OpenAI (you'll need to set OPENAI_API_KEY in environment)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// AI Question Extraction Function
async function extractQuestionsFromText(text: string): Promise<any[]> {
  try {
    const prompt = `
    Extract multiple choice questions from the following text. 
    For each question, identify:
    1. The question text
    2. The options (A, B, C, D)
    3. The correct answer
    
    Format the response as a JSON array with this structure:
    [
      {
        "question": "Question text here",
        "options": {
          "A": "Option A text",
          "B": "Option B text", 
          "C": "Option C text",
          "D": "Option D text"
        },
        "correctAnswer": "A",
        "type": "multiple-choice"
      }
    ]
    
    Text to analyze:
    ${text}
    
    Only return valid JSON, no additional text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting and formatting multiple choice questions from text. Always respond with valid JSON only."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const questions = JSON.parse(response);
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error('AI extraction error:', error);
    // Fallback to simple pattern matching
    return fallbackQuestionExtraction(text);
  }
}

// Fallback question extraction using regex patterns
function fallbackQuestionExtraction(text: string): any[] {
  const questions: any[] = [];
  
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentQuestion: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for question patterns (numbers followed by text)
    const questionMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.options && Object.keys(currentQuestion.options).length > 0) {
        questions.push(currentQuestion);
      }
      
      // Start new question
      currentQuestion = {
        question: questionMatch[2],
        options: {},
        correctAnswer: null,
        type: 'multiple-choice'
      };
      continue;
    }
    
    // Look for option patterns (A, B, C, D)
    const optionMatch = line.match(/^([A-D])[\.\)]\s*(.+)/);
    if (optionMatch && currentQuestion) {
      const optionLetter = optionMatch[1];
      const optionText = optionMatch[2];
      currentQuestion.options[optionLetter] = optionText;
    }
  }
  
  // Add the last question if it has options
  if (currentQuestion && currentQuestion.options && Object.keys(currentQuestion.options).length > 0) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

// Upload and process PDF
export const uploadPDF = upload.single('pdf');

export const processPDF = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded' });
      return;
    }

    // Extract text from PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdf(pdfBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      res.status(400).json({ error: 'No text could be extracted from the PDF' });
      return;
    }

    // Extract questions using AI
    const extractedQuestions = await extractQuestionsFromText(extractedText);

    res.json({
      success: true,
      message: `Successfully extracted ${extractedQuestions.length} questions`,
      questions: extractedQuestions,
      originalText: extractedText.substring(0, 500) + '...' // First 500 chars for preview
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all questions
export const getQuestions = async (_req: Request, res: Response) => {
  try {
    // Mock data for now - replace with actual database query
    const questions = [
      {
        _id: '1',
        examId: 'exam1',
        question: 'What is the capital of France?',
        options: {
          A: 'London',
          B: 'Paris',
          C: 'Berlin',
          D: 'Madrid'
        },
        correctAnswer: 'B',
        type: 'multiple-choice',
        order: 1
      }
    ];
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Create a new question
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { examId, question, options, correctAnswer, type, order } = req.body;
    
    // Mock creation - replace with actual database insertion
    const newQuestion = {
      _id: Date.now().toString(),
      examId,
      question,
      options,
      correctAnswer,
      type,
      order
    };
    
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
};

// Update a question
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock update - replace with actual database update
    const updatedQuestion = {
      _id: id,
      ...updateData
    };
    
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
};

// Delete a question
export const deleteQuestion = async (_req: Request, res: Response) => {
  try {
    // Mock deletion - replace with actual database deletion
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
}; 