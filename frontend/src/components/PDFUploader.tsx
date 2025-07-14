import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ExtractedQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  type: string;
}

interface PDFUploaderProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
  onClose: () => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onQuestionsExtracted, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [extractionError, setExtractionError] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setExtractionError('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/questions/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setExtractedQuestions(data.questions);
        setPreviewText(data.originalText);
      } else {
        setExtractionError(data.error || 'Failed to process PDF');
      }
    } catch (error) {
      setExtractionError('Network error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleImportQuestions = () => {
    onQuestionsExtracted(extractedQuestions);
    onClose();
  };

  const handleEditQuestion = (index: number, field: string, value: string) => {
    const updatedQuestions = [...extractedQuestions];
    if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field.startsWith('option')) {
      const option = field.replace('option', '');
      updatedQuestions[index].options[option as 'A' | 'B' | 'C' | 'D'] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = value;
    }
    setExtractedQuestions(updatedQuestions);
  };

  return (
    <div className="pdf-uploader-overlay">
      <div className="pdf-uploader-modal">
        <div className="pdf-uploader-header">
          <h3>📄 Upload Question Paper PDF</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="pdf-uploader-content">
          {!extractedQuestions.length ? (
            <div className="upload-section">
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="upload-icon">📄</div>
                <h4>Drop your PDF here</h4>
                <p>or click to browse files</p>
                <p className="upload-hint">Supports PDF files up to 10MB</p>
              </div>

              {isUploading && (
                <div className="uploading-indicator">
                  <div className="spinner"></div>
                  <p>Processing PDF with AI...</p>
                </div>
              )}

              {extractionError && (
                <div className="error-message">
                  <p>❌ {extractionError}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="extraction-results">
              <div className="results-header">
                <h4>✅ Extracted {extractedQuestions.length} Questions</h4>
                <p>Review and edit the extracted questions before importing:</p>
              </div>

              {previewText && (
                <div className="text-preview">
                  <h5>PDF Text Preview:</h5>
                  <div className="preview-content">{previewText}</div>
                </div>
              )}

              <div className="questions-list">
                {extractedQuestions.map((question, index) => (
                  <div key={index} className="extracted-question">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleEditQuestion(index, 'question', e.target.value)}
                        className="question-text-input"
                        placeholder="Question text..."
                      />
                    </div>

                    <div className="options-section">
                      {Object.entries(question.options).map(([option, text]) => (
                        <div key={option} className="option-row">
                          <span className="option-label">{option})</span>
                          <input
                            type="text"
                            value={text}
                            onChange={(e) => handleEditQuestion(index, `option${option}`, e.target.value)}
                            className="option-input"
                            placeholder={`Option ${option}...`}
                          />
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            value={option}
                            checked={question.correctAnswer === option}
                            onChange={(e) => handleEditQuestion(index, 'correctAnswer', e.target.value)}
                            className="correct-radio"
                          />
                          <span className="correct-label">Correct</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="action-buttons">
                <button onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleImportQuestions} className="btn-primary">
                  Import {extractedQuestions.length} Questions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFUploader; 