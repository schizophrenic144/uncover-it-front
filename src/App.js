import React, {useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import './App.css';
import SamplesPage from './pages/SamplesPage';
import HomePage from './pages/Home';
import Family from './pages/FamilyPage';
import NotFound from './pages/NotFound';

function App() {
  useEffect(() => {
  }, []);

  return (
    <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/samples/:sampleId" element={<SamplesPage />} />
            <Route path="/family/:family_query" element={<Family />} />
            <Route path="/search/:query" element={<Family />} />
            <Route path="/latest" element={<Family />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>
    
  );
}

export default App;
