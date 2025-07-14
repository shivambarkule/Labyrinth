import { Link } from 'react-router-dom';
export default function Navigation({ darkMode, setDarkMode, setIsAuthenticated, setUser, user }) {
  return (
    <nav>
      <Link to="/">Dashboard</Link> | <Link to="/sessions">Sessions</Link> | <Link to="/classes">Classes</Link> | <Link to="/exams">Exams</Link> | <Link to="/questions">Questions</Link>
      <button onClick={() => setDarkMode(!darkMode)} style={{ marginLeft: '10px' }}>
        Toggle {darkMode ? 'Light' : 'Dark'}
      </button>
      <button onClick={() => { setIsAuthenticated(false); setUser(null); localStorage.removeItem('token'); }} style={{ marginLeft: '10px' }}>
        Logout
      </button>
    </nav>
  );
} 