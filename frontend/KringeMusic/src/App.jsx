import { Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import AdminPage from './Pages/AdminPage';
import OnBoardingPage from './Pages/OnBoardingPage'; 
import PlayerPage from './Pages/PlayerPage';
import SearchPage from './Pages/Searchpage';
import ArtistPage from './Pages/ArtistPage';
import FavoritesPage from './Pages/FavoritePage';
import HistoryPage from './Pages/HistoryPage';
import LibraryPage from './pages/LibraryPage';
import PlaylistPage from './pages/PlaylistPage';
import AlbumPage from './pages/AlbumPage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnBoardingPage />} /> 
        <Route path="/admin" element={<AdminPage />} />
        <Route path='/player' element={<PlayerPage/>} />
        <Route path="/search" element={<SearchPage />} />
        <Route path='/artist/:artistId' element={<ArtistPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path='/history' element={<HistoryPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/playlist/:typeId/:userId/:playlistId" element={<PlaylistPage />} />
        <Route path="/artist/:artistId/album/:albumId" element={<AlbumPage />} />
      </Routes>
  );
}


export default App;