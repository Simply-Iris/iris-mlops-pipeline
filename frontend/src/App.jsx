import { useState } from 'react';
import PredictForm from './components/PredictForm';
import HistoryTable from './components/HistoryTable';
import DashboardLinks from './components/DashboardLinks';
import './index.css';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="app">
      <nav className="navbar">
        <h1 onClick={() => setPage('home')} className="logo">🌸 Iris ML</h1>
        <div className="nav-links">
          <button onClick={() => setPage('home')}>Home</button>
          <button onClick={() => setPage('predict')}>Predict</button>
          <button onClick={() => setPage('history')}>History</button>
          <button onClick={() => setPage('dashboards')}>Dashboards</button>
        </div>
      </nav>

      <main>
        {page === 'home' && (
          <div className="hero">
            <h2>🌷 Iris Classifier Pipeline</h2>
            <p>A fully containerised ML system — train, predict, track, monitor!! 🐳✨</p>
            <div className="hero-buttons">
              <button onClick={() => setPage('predict')}>Try a Prediction 🌸</button>
              <button onClick={() => setPage('history')}>View History 📜</button>
            </div>
          </div>
        )}
        {page === 'predict' && <PredictForm />}
        {page === 'history' && <HistoryTable />}
        {page === 'dashboards' && <DashboardLinks />}
      </main>
    </div>
  );
}

export default App;