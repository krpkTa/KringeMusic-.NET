import { Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import AdminPage from './Pages/AdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;