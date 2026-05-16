import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import PublicSubmit from './pages/PublicSubmit';
import LoadingPage from './pages/LoadingPage';
import ReportPage from './pages/ReportPage';
import NotFound from './pages/NotFound';

import { analyseDeck, getReport } from './api/analyse';

function DealLensFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSection, setActiveSection] = useState('scorecard');
  const [liveReport, setLiveReport] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async (file) => {
    setUploadError(null);
    setCurrentStep(1);
    setLiveReport(null);
    navigate('/loading');
    
    let step = 1;
    const interval = setInterval(() => {
      step = step < 4 ? step + 1 : 4; 
      setCurrentStep(step);
    }, 4000); 

    try {
      const data = await analyseDeck(file);
      clearInterval(interval);
      setCurrentStep(5);
      setLiveReport(data);
      
      setTimeout(() => navigate(`/report/${data.report_id}`), 5000);
      
    } catch (err) {
      clearInterval(interval);
      console.error("Upload error:", err);
      setUploadError(err.response?.data?.detail || "Analysis failed. Ensure the backend is running.");
      navigate(user ? '/dashboard' : '/');
    }
  };

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Routes>
      {/* Public Marketing Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />

      {/* Protected Investor Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage onUpload={handleUpload} error={uploadError} />
        </ProtectedRoute>
      } />
      
      {/* Shared Flow Routes */}
      <Route path="/loading" element={<LoadingPage currentStep={currentStep} />} />
      <Route 
        path="/report/:id" 
        element={
          <ReportRouteWrapper 
            liveReport={liveReport}
            activeSection={activeSection}
            handleNavigate={handleNavigate}
          />
        } 
      />

      {/* Public Bio Link Route (Must be last) */}
      <Route path="/:handle" element={<PublicSubmit />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function ReportRouteWrapper({ liveReport, activeSection, handleNavigate }) {
  const { id } = useParams();
  const [reportData, setReportData] = useState(liveReport);
  const [loading, setLoading] = useState(!liveReport && id);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const hydrateReportFromBackend = async () => {
      if (liveReport) {
        setReportData(liveReport);
        setLoading(false);
      } else {
        setLoading(true);
      }

      setFetchError(null);

      const maxAttempts = 5;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const data = await getReport(id);
          if (cancelled) return;

          setReportData(data);

          const hasQuestions = Array.isArray(data?.questions) && data.questions.length > 0;
          const isLastAttempt = attempt === maxAttempts;

          if (hasQuestions || isLastAttempt) {
            setLoading(false);
            return;
          }
        } catch (err) {
          if (cancelled) return;
          console.error("Failed to fetch report:", err);
          if (attempt === maxAttempts) {
            setFetchError("Could not load report from backend.");
            setLoading(false);
            return;
          }
        }

        await wait(1200);
      }
    };

    hydrateReportFromBackend();

    return () => {
      cancelled = true;
    };
  }, [id, liveReport]);

  if (loading) {
    return <div className="min-h-screen bg-[#08090a] flex items-center justify-center text-[#8a8f98] font-mono">Loading report...</div>;
  }

  if (fetchError || !reportData) {
    return <NotFound />;
  }

  return (
    <ReportPage 
      report={reportData}
      reportId={id}
      filename={reportData.file_name || "report.pdf"}
      activeSection={activeSection}
      onNavigate={handleNavigate}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DealLensFlow />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
