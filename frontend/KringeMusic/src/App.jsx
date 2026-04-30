import { Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import AdminPage from './Pages/AdminPage';
import OnBoardingPage from './Pages/OnBoardingPage'; // имя импорта совпадает с экспортом
import PlayerPage from './Pages/PlayerPage';
import SearchPage from './Pages/Searchpage';
import ArtistPage from './Pages/ArtistPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnBoardingPage />} />  {/* используем то же имя */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path='/player' element={<PlayerPage/>} />
      <Route path="/search" element={<SearchPage />} />
      <Route path='/artist/:artistId' element={<ArtistPage />} />
    </Routes>
  );
}

export default App;