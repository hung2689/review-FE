import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { DataReviewPage } from './pages/DataReviewPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { PracticePage } from './pages/PracticePage';
import { PracticeSetupPage } from './pages/PracticeSetupPage';
import { ResultsPage } from './pages/ResultsPage';
import { WrongPracticePage } from './pages/WrongPracticePage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/practice/setup" element={<PracticeSetupPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/wrong" element={<WrongPracticePage />} />
        <Route path="/data-review" element={<DataReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

