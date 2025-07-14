import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import PDFUploader from './components/PDFUploader';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Theme Context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {}
});

// Toast Context
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {}
});

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  username: string;
}

interface Session {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Class {
  _id: string;
  name: string;
  description: string;
  sessionId: string;
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  classId: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Question {
  _id: string;
  examId: string;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  marks: number;
  options?: string[];
  correctAnswer?: string | string[];
  order: number;
}

// Toast Component
const ToastContainer: React.FC<{ toasts: Toast[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => (
  <div className="toast-container">
    {toasts.map(toast => (
      <div key={toast.id} className={`toast toast-${toast.type}`}>
        <div className="toast-content">
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
        <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
      </div>
    ))}
  </div>
);

// Loading Skeleton Component
const SkeletonCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-badge"></div>
    </div>
    <div className="skeleton-line skeleton-text"></div>
    <div className="skeleton-line skeleton-text short"></div>
    <div className="skeleton-footer">
      <div className="skeleton-button"></div>
      <div className="skeleton-button"></div>
    </div>
  </div>
);

function App() {
  const { login, signup, sendEmailLink, completeEmailLinkSignIn } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'sessions' | 'classes' | 'exams' | 'questions'>('login');
  
  // Data states
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Selected items for navigation
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'session' | 'class' | 'exam' | 'question'>('session');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Theme functions
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  // Toast functions
  const showToast = (message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Set theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Complete email link sign-in on mount
  useEffect(() => {
    completeEmailLinkSignIn()
      .then((result: any) => {
        if (result && result.user) {
          const mockUser: User = {
            _id: result.user.uid,
            name: result.user.displayName || 'Admin',
            email: result.user.email || '',
            role: 'admin',
            username: result.user.email?.split('@')[0] || 'admin'
          };
          setUser(mockUser);
          setIsAuthenticated(true);
          setCurrentView('dashboard');
        }
      })
      .catch(() => {});
  }, []);

  // Firebase login function
  const handleLogin = async (email: string, password: string, fullName: string, username: string) => {
    setIsLoading(true);
    
    try {
      // Try to sign in first, if user doesn't exist, create account
      try {
        await login(email, password);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // User doesn't exist, create new account
          await signup(email, password, fullName);
        } else {
          throw error;
        }
      }
      
      const trimmedName = fullName.trim();
      const mockUser: User = {
        _id: '1',
        name: trimmedName || 'Admin',
        email,
        role: 'admin',
        username
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      loadMockData();
      showToast(`Welcome back, ${mockUser.name}!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
    setSelectedSession(null);
    setSelectedClass(null);
    setSelectedExam(null);
    showToast('Successfully logged out', 'info');
  };

  // Load empty data (demo sessions removed)
  const loadMockData = () => {
    setSessions([]);
    setClasses([]);
    setExams([]);
    setQuestions([]);
  };

  // CRUD Operations
  const createItem = (type: string, data: any) => {
    const newId = Date.now().toString();
    switch (type) {
      case 'session':
        setSessions(prev => [...prev, { ...data, _id: newId }]);
        showToast('Session created successfully!', 'success');
        break;
      case 'class':
        setClasses(prev => [...prev, { ...data, _id: newId, sessionId: selectedSession?._id }]);
        showToast('Class created successfully!', 'success');
        break;
      case 'exam':
        setExams(prev => [...prev, { ...data, _id: newId, classId: selectedClass?._id }]);
        showToast('Exam created successfully!', 'success');
        break;
      case 'question':
        setQuestions(prev => [...prev, { ...data, _id: newId, examId: selectedExam?._id, order: prev.filter(q => q.examId === selectedExam?._id).length + 1 }]);
        showToast('Question created successfully!', 'success');
        break;
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const updateItem = (type: string, id: string, data: any) => {
    switch (type) {
      case 'session':
        setSessions(prev => prev.map(item => item._id === id ? { ...item, ...data } : item));
        showToast('Session updated successfully!', 'success');
        break;
      case 'class':
        setClasses(prev => prev.map(item => item._id === id ? { ...item, ...data } : item));
        showToast('Class updated successfully!', 'success');
        break;
      case 'exam':
        setExams(prev => prev.map(item => item._id === id ? { ...item, ...data } : item));
        showToast('Exam updated successfully!', 'success');
        break;
      case 'question':
        setQuestions(prev => prev.map(item => item._id === id ? { ...item, ...data } : item));
        showToast('Question updated successfully!', 'success');
        break;
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const deleteItem = (type: string, id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      switch (type) {
        case 'session':
          setSessions(prev => prev.filter(item => item._id !== id));
          setClasses(prev => prev.filter(item => item.sessionId !== id));
          showToast('Session deleted successfully!', 'success');
          break;
        case 'class':
          setClasses(prev => prev.filter(item => item._id !== id));
          setExams(prev => prev.filter(item => item.classId !== id));
          showToast('Class deleted successfully!', 'success');
          break;

  const openModal = (type: 'session' | 'class' | 'exam' | 'question', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setShowModal(true);
  };

  // Navigation functions
  const navigateToClasses = (session: Session) => {
    setSelectedSession(session);
    setCurrentView('classes');
  };

  const navigateToExams = (classItem: Class) => {
    setSelectedClass(classItem);
    setCurrentView('exams');
  };

  const navigateToQuestions = (exam: Exam) => {
    setSelectedExam(exam);
    setCurrentView('questions');
  };

  
        case 'exam':
          setExams(prev => prev.filter(item => item._id !== id));
          setQuestions(prev => prev.filter(item => item.examId !== id));
          break;
        case 'question':
          setQuestions(prev => prev.filter(item => item._id !== id));
          break;
      }
    }
  };

  const openModal = (type: 'session' | 'class' | 'exam' | 'question', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);
    setShowModal(true);
  };

  // Navigation functions
  const navigateToClasses = (session: Session) => {
    setSelectedSession(session);
    setCurrentView('classes');
  };

  const navigateToExams = (classItem: Class) => {
    setSelectedClass(classItem);
    setCurrentView('exams');
  };

  const navigateToQuestions = (exam: Exam) => {
    setSelectedExam(exam);
    setCurrentView('questions');
  };

  const LoginForm = () => {
    const [authMethod, setAuthMethod] = useState<'email' | 'emailLink' | 'phone'>('email');
    const [isSignUp, setIsSignUp] = useState(false); // <-- Add signup toggle state
    // Email/Password states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    // Email Link states
    // (reuse email)
    // Phone Auth states
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const { sendPhoneCode, confirmPhoneCode } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const handleSendLink = async () => {
      try {
        await sendEmailLink(email);
        showToast('Sign-in link sent! Check your email.', 'success');
      } catch (err: any) {
        showToast('Error sending link: ' + (err.message || err), 'error');
      }
    };
    const handleSendCode = async () => {
      try {
        await sendPhoneCode(phone, 'recaptcha-container');
        setIsCodeSent(true);
        showToast('Verification code sent!', 'success');
      } catch (err: any) {
        showToast('Error sending code: ' + (err.message || err), 'error');
      }
    };
    const handleConfirmCode = async () => {
      try {
        const result = await confirmPhoneCode(code);
        const mockUser: User = {
          _id: result.user.uid,
          name: result.user.displayName || 'Admin',
          email: result.user.email || '',
          role: 'admin',
          username: result.user.phoneNumber || 'admin'
        };
        setUser(mockUser);
        showToast('Phone verified and signed in!', 'success');
        setIsAuthenticated(true);
        setCurrentView('dashboard');
      } catch (err: any) {
        showToast('Error verifying code: ' + (err.message || err), 'error');
      }
    };

    return (
      <div className="login-container">
        <div className="login-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">🎓</div>
              <h1 className="labyrinth-gradient">Labyrinth</h1>
            </div>
            <p className="login-subtitle">Advanced Labyrinth Management Platform</p>
          </div>
          
          <div className="auth-method-selector">
            <button type="button" className={`auth-method-btn${authMethod === 'email' ? ' selected' : ''}`} onClick={() => setAuthMethod('email')}>Email/Password</button>
            <button type="button" className={`auth-method-btn${authMethod === 'emailLink' ? ' selected' : ''}`} onClick={() => setAuthMethod('emailLink')}>Email Link</button>
            <button type="button" className={`auth-method-btn${authMethod === 'phone' ? ' selected' : ''}`} onClick={() => setAuthMethod('phone')}>Phone</button>
          </div>
          {authMethod === 'email' && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (isSignUp) {
                await signup(email, password, fullName, username);
              } else {
                await handleLogin(email, password, fullName, username);
              }
            }} className="login-form-content">
            
            <div className="form-group modern">
              <div className="input-container">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="modern-input"
                  disabled={isLoading}
                />
                <label className="floating-label">Full Name</label>
              </div>
            </div>

            <div className="form-group modern">
              <div className="input-container">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                  className="modern-input"
                  disabled={isLoading}
                />
                <label className="floating-label">Username</label>
              </div>
            </div>
            
            <div className="form-group modern">
              <div className="input-container">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  className="modern-input"
                  disabled={isLoading}
                />
                <label className="floating-label">Email Address</label>
              </div>
            </div>
            
            <div className="form-group modern">
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  className="modern-input"
                  disabled={isLoading}
                />
                <label className="floating-label">Password</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`login-btn modern ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>{isSignUp ? 'Signing Up...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                  <div className="btn-arrow">→</div>
                </>
              )}
            </button>
            </form>
          )}
          {authMethod === 'emailLink' && (
            <form onSubmit={e => e.preventDefault()} className="login-form-content">
              <div className="form-group modern">
                <div className="input-container">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="modern-input"
                    disabled={isLoading}
                  />
                  <label className="floating-label">Email Address</label>
                </div>
              </div>
              <button
                type="button"
                className="login-btn modern"
                style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, #7fff00 0%, #a259f7 100%)', color: '#222' }}
                onClick={handleSendLink}
                disabled={isLoading || !email}
              >
                Send me a sign-in link
              </button>
            </form>
          )}
          {authMethod === 'phone' && (
            <form onSubmit={e => e.preventDefault()} className="login-form-content">
              <div className="form-group modern">
                <div className="input-container">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="modern-input"
                    disabled={isLoading}
                  />
                  <label className="floating-label">Phone Number</label>
                </div>
                <button type="button" className="login-btn modern" onClick={handleSendCode} disabled={isLoading || !phone}>
                  Send Code
                </button>
              </div>
              <div id="recaptcha-container"></div>
              {isCodeSent && (
                <div className="form-group modern">
                  <div className="input-container">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Verification Code"
                      className="modern-input"
                      disabled={isLoading}
                    />
                    <label className="floating-label">Verification Code</label>
                  </div>
                  <button type="button" className="login-btn modern" onClick={handleConfirmCode} disabled={isLoading || !code}>
                    Confirm Code
                  </button>
                </div>
              )}
            </form>
          )}
          
          <div className="demo-info">
            <div className="info-card">
              <h4>🚀 Demo Access</h4>
              <div className="demo-options">
                <div className="demo-credential">
                  <strong>Administrator:</strong> Full system access
                </div>
              </div>
              <p className="demo-note">Use any email/password combination</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#7a7fff', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }}
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    useEffect(() => {
      // For smooth animation, use requestAnimationFrame and store target positions
      let animationFrame: number;
      // For hero bubbles, store their current and target positions
      const heroBubbles = Array.from(document.querySelectorAll('.hero-decoration .decoration-circle'));
      const heroState = heroBubbles.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));

      // For cards, store their current and target positions
      const cardSelectors = [
        '.stat-card.modern',
        '.action-card.modern',
        '.modern-card',
        '.modern-question-card'
      ];
      const allCards = Array.from(document.querySelectorAll(cardSelectors.join(',')));
      const cardState = allCards.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));

      const handleMouseMove = (e: MouseEvent) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        // Dashboard background bubbles
        const bgShapes = document.querySelectorAll('.dashboard-background .element');
        bgShapes.forEach((shape) => {
          const rect = shape.getBoundingClientRect();
          const shapeCenterX = rect.left + rect.width / 2;
          const shapeCenterY = rect.top + rect.height / 2;
          const distance = Math.sqrt(
            Math.pow(mouseX - shapeCenterX, 2) + Math.pow(mouseY - shapeCenterY, 2)
          );
          const maxDistance = 250;
          const magnetStrength = Math.max(0, (maxDistance - distance) / maxDistance);
          if (distance < maxDistance) {
            (shape as HTMLElement).style.animation = 'none';
            (shape as HTMLElement).style.transform = `translate(${(mouseX - shapeCenterX) * magnetStrength * 0.3}px, ${(mouseY - shapeCenterY) * magnetStrength * 0.3}px)`;
          } else {
            (shape as HTMLElement).style.transform = '';
            (shape as HTMLElement).style.animation = '';
          }
        });
        // Hero bubbles: set target positions based on pointer
        heroBubbles.forEach((bubble, i) => {
          const rect = bubble.getBoundingClientRect();
          const bubbleCenterX = rect.left + rect.width / 2;
          const bubbleCenterY = rect.top + rect.height / 2;
          const distance = Math.sqrt(
            Math.pow(mouseX - bubbleCenterX, 2) + Math.pow(mouseY - bubbleCenterY, 2)
          );
          const maxDistance = 600;
          const magnetStrength = Math.max(0, (maxDistance - distance) / maxDistance);
          if (distance < maxDistance) {
            heroState[i].tx = (mouseX - bubbleCenterX) * magnetStrength * 0.5;
            heroState[i].ty = (mouseY - bubbleCenterY) * magnetStrength * 0.5;
            // Disable CSS animation when mouse is near
            (bubble as HTMLElement).style.animation = 'none';
          } else {
            heroState[i].tx = 0;
            heroState[i].ty = 0;
            // Re-enable CSS animation when mouse is far
            (bubble as HTMLElement).style.animation = '';
          }
        });
        // Cards: set target positions based on pointer
        allCards.forEach((card, i) => {
          const rect = card.getBoundingClientRect();
          const cardCenterX = rect.left + rect.width / 2;
          const cardCenterY = rect.top + rect.height / 2;
          const distance = Math.sqrt(
            Math.pow(mouseX - cardCenterX, 2) + Math.pow(mouseY - cardCenterY, 2)
          );
          const maxDistance = 350;
          const magnetStrength = Math.max(0, (maxDistance - distance) / maxDistance);
          if (distance < maxDistance) {
            cardState[i].tx = (mouseX - cardCenterX) * magnetStrength * 0.15;
            cardState[i].ty = (mouseY - cardCenterY) * magnetStrength * 0.15;
          } else {
            cardState[i].tx = 0;
            cardState[i].ty = 0;
          }
        });
      };

      const animate = () => {
        // Animate hero bubbles
        heroBubbles.forEach((bubble, i) => {
          heroState[i].x += (heroState[i].tx - heroState[i].x) * 0.12;
          heroState[i].y += (heroState[i].ty - heroState[i].y) * 0.12;
          (bubble as HTMLElement).style.transform = `translate(${heroState[i].x}px, ${heroState[i].y}px)`;
        });
        // Animate cards
        allCards.forEach((card, i) => {
          cardState[i].x += (cardState[i].tx - cardState[i].x) * 0.18;
          cardState[i].y += (cardState[i].ty - cardState[i].y) * 0.18;
          (card as HTMLElement).style.transform = `translate(${cardState[i].x}px, ${cardState[i].y}px)`;
        });
        animationFrame = requestAnimationFrame(animate);
      };

      window.addEventListener('mousemove', handleMouseMove);
      animate();
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrame);
        // Reset transforms
        heroBubbles.forEach((bubble) => {
          (bubble as HTMLElement).style.transform = '';
        });
        allCards.forEach((card) => {
          (card as HTMLElement).style.transform = '';
        });
      };
    }, []);
    
    const stats = [
      {
        id: 'sessions',
        title: 'Active Sessions',
        value: sessions.filter(s => s.isActive).length,
        icon: '🎯',
        color: 'primary',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        description: 'Currently running examination sessions'
      },
      {
        id: 'classes',
        title: 'Total Classes',
        value: classes.length,
        icon: '🏛️',
        color: 'success',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        description: 'Classes across all sessions'
      },
      {
        id: 'exams',
        title: 'Active Exams',
        value: exams.filter(e => e.isActive).length,
        icon: '📋',
        color: 'warning',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        description: 'Ongoing examinations'
      },
      {
        id: 'questions',
        title: 'Total Questions',
        value: questions.length,
        icon: '❓',
        color: 'info',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        description: 'Questions in question bank'
      }
    ];

    const quickActions = [
      {
        id: 'sessions',
        title: 'Manage Sessions',
        description: 'View and organize examination sessions',
        icon: '📚',
        action: () => setCurrentView('sessions'),
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        available: true
      },
      {
        id: 'create-session',
        title: 'Create Session',
        description: 'Start a new examination session',
        icon: '➕',
        action: () => openModal('session'),
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        available: user?.role === 'admin'
      },
      {
        id: 'analytics',
        title: 'View Analytics',
        description: 'Examine performance metrics',
        icon: '📊',
        action: () => setCurrentView('sessions'),
        gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
        available: user?.role === 'admin'
      },
      {
        id: 'settings',
        title: 'System Settings',
        description: 'Configure examination parameters',
        icon: '⚙️',
        action: () => showToast('Settings coming soon!', 'info'),
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        available: user?.role === 'admin'
      }
    ];

    return (
      <div className="dashboard modern">
        {/* Animated Background Elements */}
        <div className="dashboard-background">
          <div className="floating-elements">
            <div className="element element-1"></div>
            <div className="element element-2"></div>
            <div className="element element-3"></div>
            <div className="element element-4"></div>
          </div>
        </div>

        {/* Welcome Header */}
        <div className="dashboard-hero">
          <div className="hero-content">
            <div className="welcome-text">
              <h1>Welcome back, Admin 👋</h1>
              <p className="welcome-subtitle">
                {user?.role === 'admin' 
                  ? 'Manage your examination environment with ease'
                  : 'Ready to take your examinations?'}
              </p>
            </div>
            <div className="hero-decoration">
              <div className="decoration-circle circle-1"></div>
              <div className="decoration-circle circle-2"></div>
              <div className="decoration-circle circle-3"></div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-section">
          <h2 className="section-title">
            <span className="title-icon">📊</span>
            Overview Statistics
          </h2>
          <div className="stats-grid modern">
            {stats.map((stat, index) => (
              <div
                key={stat.id}
                className={`stat-card modern ${hoveredCard === stat.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(stat.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ 
                  '--card-gradient': stat.gradient,
                  '--animation-delay': `${index * 0.1}s`
                } as React.CSSProperties}
              >
                <div className="stat-card-background"></div>
                <div className="stat-card-content">
                  <div className="stat-header">
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-pulse"></div>
                  </div>
                  <div className="stat-body">
                    <div className="stat-value">
                      <span className="stat-number">{stat.value}</span>
                      <div className="stat-growth">
                        <span className="growth-indicator">↗</span>
                        <span className="growth-text">Active</span>
                      </div>
                    </div>
                    <div className="stat-info">
                      <h3 className="stat-title">{stat.title}</h3>
                      <p className="stat-description">{stat.description}</p>
                    </div>
                  </div>
                </div>
                <div className="stat-card-glow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <h2 className="section-title">
            <span className="title-icon">⚡</span>
            Quick Actions
          </h2>
          <div className="actions-grid modern">
            {quickActions
              .filter(action => action.available)
              .map((action, index) => (
                <div
                  key={action.id}
                  className={`action-card modern ${hoveredCard === action.id ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredCard(action.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={action.action}
                  style={{
                    '--card-gradient': action.gradient,
                    '--animation-delay': `${index * 0.15}s`
                  } as React.CSSProperties}
                >
                  <div className="action-card-background"></div>
                  <div className="action-card-content">
                    <div className="action-icon-container">
                      <div className="action-icon">{action.icon}</div>
                      <div className="action-ripple"></div>
                    </div>
                    <div className="action-text">
                      <h3 className="action-title">{action.title}</h3>
                      <p className="action-description">{action.description}</p>
                    </div>
                    <div className="action-arrow">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="action-card-glow"></div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        {sessions.length > 0 && (
          <div className="recent-activity-section">
            <h2 className="section-title">
              <span className="title-icon">🕒</span>
              Recent Activity
            </h2>
            <div className="activity-timeline">
              {sessions.slice(0, 3).map((session, index) => (
                <div
                  key={session._id}
                  className="timeline-item"
                  style={{ '--animation-delay': `${index * 0.2}s` } as React.CSSProperties}
                >
                  <div className="timeline-marker">
                    <div className="marker-dot"></div>
                    <div className="marker-pulse"></div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{session.name}</h4>
                      <span className={`timeline-status ${session.isActive ? 'active' : 'inactive'}`}>
                        {session.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="timeline-description">{session.description}</p>
                    <div className="timeline-meta">
                      <span className="timeline-date">
                        📅 {new Date(session.startDate).toLocaleDateString()}
                      </span>
                      <span className="timeline-classes">
                        🏫 {classes.filter(c => c.sessionId === session._id).length} classes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const SessionsView = () => (
    <div className="modern-view">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="modern-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">📚</div>
            <h2>Examination Sessions</h2>
            <div className="title-glow"></div>
          </div>
          <div className="header-description">
            Manage and monitor academic examination sessions
          </div>
        </div>
        <div className="header-actions">
          {user?.role === 'admin' && (
            <button onClick={() => openModal('session')} className="modern-btn primary">
              <span className="btn-icon">➕</span>
              <span>Create Session</span>
              <div className="btn-ripple"></div>
            </button>
          )}
          <button onClick={() => setCurrentView('dashboard')} className="modern-btn secondary">
            <span className="btn-icon">←</span>
            <span>Dashboard</span>
            <div className="btn-ripple"></div>
          </button>
        </div>
      </div>
      
      <div className="modern-grid">
        {sessions.map((session, index) => (
          <div 
            key={session._id} 
            className="modern-card session-card"
            style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
          >
            <div className="card-glow"></div>
            <div className="card-content">
              <div className="card-header">
                <div className="card-title">
                  <h3>{session.name}</h3>
                  <div className={`status-badge ${session.isActive ? 'active' : 'inactive'}`}>
                    <div className="status-dot"></div>
                    {session.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              <div className="card-description">
                {session.description}
              </div>
              <div className="card-meta">
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span>{new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🏛️</span>
                  <span>{classes.filter(c => c.sessionId === session._id).length} Classes</span>
                </div>
              </div>
              <div className="card-actions">
                <button onClick={() => navigateToClasses(session)} className="action-btn primary">
                  <span className="btn-icon">👁️</span>
                  <span>View Classes</span>
                  <div className="btn-arrow">→</div>
                </button>
                {user?.role === 'admin' && (
                  <div className="admin-actions">
                    <button onClick={() => openModal('session', session)} className="action-btn edit">
                      <span className="btn-icon">✏️</span>
                    </button>
                    <button onClick={() => deleteItem('session', session._id)} className="action-btn delete">
                      <span className="btn-icon">🗑️</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No Sessions Found</h3>
            <p>Create your first examination session to get started</p>
            {user?.role === 'admin' && (
              <button onClick={() => openModal('session')} className="modern-btn primary">
                <span className="btn-icon">➕</span>
                <span>Create Session</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const ClassesView = () => {
    const sessionClasses = classes.filter(c => c.sessionId === selectedSession?._id);
    
    return (
      <div className="modern-view">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="modern-header">
          <div className="header-content">
            <div className="modern-breadcrumb">
              <span onClick={() => setCurrentView('sessions')} className="breadcrumb-item">
                📚 Sessions
              </span>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">{selectedSession?.name}</span>
            </div>
            <div className="header-title">
              <div className="title-icon">🏛️</div>
              <h2>Classes</h2>
              <div className="title-glow"></div>
            </div>
            <div className="header-description">
              Manage classes within {selectedSession?.name}
            </div>
          </div>
          <div className="header-actions">
            {user?.role === 'admin' && (
              <button onClick={() => openModal('class')} className="modern-btn primary">
                <span className="btn-icon">➕</span>
                <span>Create Class</span>
                <div className="btn-ripple"></div>
              </button>
            )}
            <button onClick={() => setCurrentView('sessions')} className="modern-btn secondary">
              <span className="btn-icon">←</span>
              <span>Back to Sessions</span>
              <div className="btn-ripple"></div>
            </button>
          </div>
        </div>
        
        <div className="modern-grid">
          {sessionClasses.map((classItem, index) => (
            <div 
              key={classItem._id} 
              className="modern-card class-card"
              style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="card-title">
                    <h3>{classItem.name}</h3>
                  </div>
                </div>
                <div className="card-description">
                  {classItem.description}
                </div>
                <div className="card-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📝</span>
                    <span>{exams.filter(e => e.classId === classItem._id).length} Exams</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button onClick={() => navigateToExams(classItem)} className="action-btn primary">
                    <span className="btn-icon">👁️</span>
                    <span>View Exams</span>
                    <div className="btn-arrow">→</div>
                  </button>
                  {user?.role === 'admin' && (
                    <div className="admin-actions">
                      <button onClick={() => openModal('class', classItem)} className="action-btn edit">
                        <span className="btn-icon">✏️</span>
                      </button>
                      <button onClick={() => deleteItem('class', classItem._id)} className="action-btn delete">
                        <span className="btn-icon">🗑️</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {sessionClasses.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🏛️</div>
              <h3>No Classes Found</h3>
              <p>Create your first class in this session</p>
              {user?.role === 'admin' && (
                <button onClick={() => openModal('class')} className="modern-btn primary">
                  <span className="btn-icon">➕</span>
                  <span>Create Class</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ExamsView = () => {
    const classExams = exams.filter(e => e.classId === selectedClass?._id);
    
    return (
      <div className="modern-view">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="modern-header">
          <div className="header-content">
            <div className="modern-breadcrumb">
              <span onClick={() => setCurrentView('sessions')} className="breadcrumb-item">
                📚 Sessions
              </span>
              <span className="breadcrumb-separator">›</span>
              <span onClick={() => setCurrentView('classes')} className="breadcrumb-item">
                {selectedSession?.name}
              </span>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">{selectedClass?.name}</span>
            </div>
            <div className="header-title">
              <div className="title-icon">📝</div>
              <h2>Examinations</h2>
              <div className="title-glow"></div>
            </div>
            <div className="header-description">
              Manage examinations for {selectedClass?.name}
            </div>
          </div>
          <div className="header-actions">
            {user?.role === 'admin' && (
              <button onClick={() => openModal('exam')} className="modern-btn primary">
                <span className="btn-icon">➕</span>
                <span>Create Exam</span>
                <div className="btn-ripple"></div>
              </button>
            )}
            <button onClick={() => setCurrentView('classes')} className="modern-btn secondary">
              <span className="btn-icon">←</span>
              <span>Back to Classes</span>
              <div className="btn-ripple"></div>
            </button>
          </div>
        </div>
        
        <div className="modern-grid">
          {classExams.map((exam, index) => (
            <div 
              key={exam._id} 
              className="modern-card exam-card"
              style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="card-title">
                    <h3>{exam.title}</h3>
                    <div className={`status-badge ${exam.isActive ? 'active' : 'inactive'}`}>
                      <div className="status-dot"></div>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
                <div className="card-description">
                  {exam.description}
                </div>
                <div className="exam-stats">
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="stat-icon">⏱️</span>
                      <span className="stat-value">{exam.duration}</span>
                      <span className="stat-label">minutes</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">🎯</span>
                      <span className="stat-value">{exam.totalMarks}</span>
                      <span className="stat-label">total marks</span>
                    </div>
                  </div>
                  <div className="stat-row">
                    <div className="stat-item">
                      <span className="stat-icon">✅</span>
                      <span className="stat-value">{exam.passingMarks}</span>
                      <span className="stat-label">to pass</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">❓</span>
                      <span className="stat-value">{questions.filter(q => q.examId === exam._id).length}</span>
                      <span className="stat-label">questions</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button onClick={() => navigateToQuestions(exam)} className="action-btn primary">
                    <span className="btn-icon">👁️</span>
                    <span>View Questions</span>
                    <div className="btn-arrow">→</div>
                  </button>
                  {user?.role === 'admin' && (
                    <div className="admin-actions">
                      <button onClick={() => openModal('exam', exam)} className="action-btn edit">
                        <span className="btn-icon">✏️</span>
                      </button>
                      <button onClick={() => deleteItem('exam', exam._id)} className="action-btn delete">
                        <span className="btn-icon">🗑️</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {classExams.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No Exams Found</h3>
              <p>Create your first examination for this class</p>
              {user?.role === 'admin' && (
                <button onClick={() => openModal('exam')} className="modern-btn primary">
                  <span className="btn-icon">➕</span>
                  <span>Create Exam</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const QuestionsView = () => {
    const examQuestions = questions.filter(q => q.examId === selectedExam?._id).sort((a, b) => a.order - b.order);
    const [showPDFUploader, setShowPDFUploader] = useState(false);

    const handleQuestionsExtracted = (extractedQuestions: any[]) => {
      // Add the extracted questions to the questions state
      const examIdStr = (selectedExam?._id || '') as string;
      const newQuestions = extractedQuestions.map((q, index) => ({
        _id: Date.now().toString() + index,
        examId: examIdStr,
        questionText: q.question,
        questionType: q.type as 'multiple-choice' | 'true-false' | 'short-answer' | 'essay',
        marks: 1,
        options: Object.values(q.options) as string[],
        correctAnswer: q.correctAnswer,
        order: questions.filter(question => question.examId === examIdStr).length + index + 1
      }));
      
      setQuestions(prev => [...prev, ...newQuestions]);
      showToast(`Successfully imported ${extractedQuestions.length} questions!`, 'success');
    };

    return (
      <div className="modern-view">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="modern-header">
          <div className="header-content">
            <div className="modern-breadcrumb">
              <span onClick={() => setCurrentView('sessions')} className="breadcrumb-item">
                📚 Sessions
              </span>
              <span className="breadcrumb-separator">›</span>
              <span onClick={() => setCurrentView('classes')} className="breadcrumb-item">
                {selectedSession?.name}
              </span>
              <span className="breadcrumb-separator">›</span>
              <span onClick={() => setCurrentView('exams')} className="breadcrumb-item">
                {selectedClass?.name}
              </span>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">{selectedExam?.title}</span>
            </div>
            <div className="header-title">
              <div className="title-icon">❓</div>
              <h2>Questions</h2>
              <div className="title-glow"></div>
            </div>
            <div className="header-description">
              Manage questions for {selectedExam?.title}
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowPDFUploader(true)} className="modern-btn primary">
              <span className="btn-icon">📄</span>
              <span>Upload PDF</span>
              <div className="btn-ripple"></div>
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => openModal('question')} className="modern-btn primary">
                <span className="btn-icon">➕</span>
                <span>Add Question</span>
                <div className="btn-ripple"></div>
              </button>
            )}
            <button onClick={() => setCurrentView('exams')} className="modern-btn secondary">
              <span className="btn-icon">←</span>
              <span>Back to Exams</span>
              <div className="btn-ripple"></div>
            </button>
          </div>
        </div>
        
        <div className="questions-container">
          {examQuestions.map((question, index) => (
            <div 
              key={question._id} 
              className="modern-question-card"
              style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
            >
              <div className="question-content">
                <div className="question-header">
                  <div className="question-number">
                    <span className="number-icon">❓</span>
                    <span className="number">{index + 1}</span>
                  </div>
                  <div className="question-meta">
                    <span className="meta-badge type">{question.questionType}</span>
                    <span className="meta-badge marks">1 mark</span>
                  </div>
                </div>
                
                <div className="question-text">
                  {question.questionText}
                </div>
                
                {question.options && (
                  <div className="question-options">
                    {question.options.map((option: string, idx: number) => (
                      <div 
                        key={idx} 
                        className={`option-item ${option === question.correctAnswer ? 'correct' : ''}`}
                      >
                        <div className="option-label">{String.fromCharCode(65 + idx)}</div>
                        <div className="option-text">{option}</div>
                        {option === question.correctAnswer && (
                          <div className="correct-indicator">✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {user?.role === 'admin' && (
                  <div className="question-actions">
                    <button onClick={() => openModal('question', question)} className="action-btn edit">
                      <span className="btn-icon">✏️</span>
                    </button>
                    <button onClick={() => deleteItem('question', question._id)} className="action-btn delete">
                      <span className="btn-icon">🗑️</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {examQuestions.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">❓</div>
              <h3>No Questions Found</h3>
              <p>Get started by adding questions manually or upload a PDF to extract questions automatically.</p>
              <div className="action-buttons">
                <button onClick={() => setShowPDFUploader(true)} className="btn-primary">
                  <span className="btn-icon">📄</span>
                  <span>Upload PDF</span>
                </button>
                <button onClick={() => openModal('question')} className="btn-secondary">
                  <span className="btn-icon">➕</span>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {showPDFUploader && (
          <PDFUploader
            onQuestionsExtracted={handleQuestionsExtracted}
            onClose={() => setShowPDFUploader(false)}
          />
        )}
      </div>
    );
  };

  const Modal = () => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
      if (editingItem) {
        setFormData(editingItem);
      } else {
        setFormData({});
      }
    }, [editingItem, showModal]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingItem) {
        updateItem(modalType, editingItem._id, formData);
      } else {
        createItem(modalType, formData);
      }
    };

    const renderFormFields = () => {
      switch (modalType) {
        case 'session':
          return (
            <>
              <div className="form-group">
                <label>Session Name:</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Active Session
                </label>
              </div>
            </>
          );
        case 'class':
          return (
            <>
              <div className="form-group">
                <label>Class Name:</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
            </>
          );
        case 'exam':
          return (
            <>
              <div className="form-group">
                <label>Exam Title:</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes):</label>
                  <input
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Marks:</label>
                  <input
                    type="number"
                    value={formData.totalMarks || ''}
                    onChange={(e) => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Passing Marks:</label>
                  <input
                    type="number"
                    value={formData.passingMarks || ''}
                    onChange={(e) => setFormData({...formData, passingMarks: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive || false}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    Active Exam
                  </label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time:</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time:</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
            </>
          );
        case 'question':
          // Initialize options if not present
          if (!formData.options) {
            formData.options = ['', ''];
          }

          const addOption = () => {
            const newOptions = [...(formData.options || []), ''];
            setFormData({...formData, options: newOptions});
          };

          const removeOption = (index: number) => {
            const newOptions = formData.options.filter((_: any, i: number) => i !== index);
            setFormData({...formData, options: newOptions});
          };

          const updateOption = (index: number, value: string) => {
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData({...formData, options: newOptions});
          };

          return (
            <>
              <div className="form-group">
                <label>Question Text:</label>
                <textarea
                  value={formData.questionText || ''}
                  onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                  required
                  rows={3}
                  placeholder="Enter your question here..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Question Type:</label>
                  <select
                    value={formData.questionType || 'multiple-choice'}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let newFormData = {...formData, questionType: newType};
                      
                      // Reset options and correct answer when type changes
                      if (newType === 'multiple-choice') {
                        newFormData.options = ['', ''];
                        newFormData.correctAnswer = '';
                      } else if (newType === 'true-false') {
                        newFormData.options = undefined;
                        newFormData.correctAnswer = '';
                      } else {
                        newFormData.options = undefined;
                        newFormData.correctAnswer = undefined;
                      }
                      
                      setFormData(newFormData);
                    }}
                    required
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Marks:</label>
                  <input
                    type="number"
                    value={formData.marks || ''}
                    onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                    required
                    min="1"
                    placeholder="Points"
                  />
                </div>
              </div>

              {/* Multiple Choice Options */}
              {formData.questionType === 'multiple-choice' && (
                <div className="question-type-section">
                  <div className="options-section">
                    <label>Answer Options:</label>
                    <div className="options-container">
                      {formData.options.map((option: string, index: number) => (
                        <div key={index} className="option-row">
                          <div className="option-label">{String.fromCharCode(65 + index)}.</div>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            required
                          />
                          {formData.options.length > 2 && (
                            <button 
                              type="button" 
                              className="remove-option-btn"
                              onClick={() => removeOption(index)}
                              title="Remove option"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="add-option-btn"
                        onClick={addOption}
                        disabled={formData.options.length >= 6}
                      >
                        ➕ Add Option
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Correct Answer:</label>
                    <select
                      value={formData.correctAnswer || ''}
                      onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                      required
                    >
                      <option value="">Select correct answer</option>
                      {formData.options && formData.options.map((option: string, idx: number) => (
                        option.trim() && <option key={idx} value={option}>{String.fromCharCode(65 + idx)}. {option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* True/False Options */}
              {formData.questionType === 'true-false' && (
                <div className="question-type-section">
                  <div className="form-group">
                    <label>Correct Answer:</label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="trueFalseAnswer"
                          value="true"
                          checked={formData.correctAnswer === 'true'}
                          onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                          required
                        />
                        <span>True</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="trueFalseAnswer"
                          value="false"
                          checked={formData.correctAnswer === 'false'}
                          onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                          required
                        />
                        <span>False</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Short Answer - No additional fields needed */}
              {formData.questionType === 'short-answer' && (
                <div className="question-type-section">
                  <div className="info-message">
                    <p>📝 Short answer questions will be manually graded by instructors.</p>
                  </div>
                </div>
              )}

              {/* Essay - No additional fields needed */}
              {formData.questionType === 'essay' && (
                <div className="question-type-section">
                  <div className="info-message">
                    <p>📄 Essay questions will be manually graded by instructors.</p>
                  </div>
                </div>
              )}
            </>
          );
        default:
          return null;
      }
    };

    if (!showModal) return null;

    return (
      <div className="modern-modal-overlay" onClick={() => setShowModal(false)}>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>
        <div className="modern-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-glow"></div>
          <div className="modal-inner">
            <div className="modern-modal-header">
              <div className="modal-title">
                <div className="title-icon">
                  {modalType === 'session' ? '📚' : 
                   modalType === 'class' ? '🏛️' : 
                   modalType === 'exam' ? '📝' : '❓'}
                </div>
                <h3>{editingItem ? `Edit ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}` : `Create ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}</h3>
              </div>
              <button className="modern-modal-close" onClick={() => setShowModal(false)}>
                <span>×</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modern-modal-form">
              <div className="form-content">
                {renderFormFields()}
              </div>
              <div className="modern-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="modern-btn secondary">
                  <span className="btn-icon">✕</span>
                  <span>Cancel</span>
                </button>
                <button type="submit" className="modern-btn primary">
                  <span className="btn-icon">{editingItem ? '✓' : '+'}</span>
                  <span>{editingItem ? 'Update' : 'Create'}</span>
                  <div className="btn-ripple"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const Navigation = () => (
    <nav className="navigation modern">
      <div className="nav-content">
        <div className="nav-brand">
          <div className="brand-logo">
            <div className="logo-icon">🎓</div>
            <span className="brand-text labyrinth-gradient">Labyrinth</span>
          </div>
        </div>
        
        <div className="nav-center">
          <div className="nav-links">
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              title="Dashboard"
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </button>
            <button 
              onClick={() => setCurrentView('sessions')}
              className={`nav-link ${currentView === 'sessions' ? 'active' : ''}`}
              title="Sessions"
            >
              <span className="nav-icon">📚</span>
              <span className="nav-text">Sessions</span>
            </button>
          </div>
        </div>
        
        <div className="nav-actions">
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <div className="theme-toggle-track">
              <div className="theme-toggle-thumb">
                {isDark ? '🌙' : '☀️'}
              </div>
            </div>
          </button>
          
          <div className="user-menu">
            <div className="user-avatar">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name}&background=667eea&color=fff`} 
                alt={user?.name}
              />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Sign Out">
              <span>🚪</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  if (!isAuthenticated) {
    return (
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <ToastContext.Provider value={{ showToast }}>
          <LoginForm />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ToastContext.Provider value={{ showToast }}>
        <div className="App">
          <Navigation />
          <main className="main-content">
            {isLoading ? (
              <div className="loading-container">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <>
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'sessions' && <SessionsView />}
                {currentView === 'classes' && <ClassesView />}
                {currentView === 'exams' && <ExamsView />}
                {currentView === 'questions' && <QuestionsView />}
              </>
            )}
          </main>
          <Modal />
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}

// Wrapper component to provide Firebase Auth context
function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
