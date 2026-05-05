import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import LoadingPage from './pages/LoadingPage';
import ReportPage from './pages/ReportPage';
import NotFound from './pages/NotFound';
import { mockReport } from './data/mockReport';
import { analyseDeck, getReport } from './api/analyse';

function DealLensFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSection, setActiveSection] = useState('scorecard');
  const [liveReport, setLiveReport] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async (file) => {
    setUploadError(null);
    navigate('/loading');
    
    // Optimistic loading animation (caps at step 4 until the API resolves)
    let step = 1;
    setCurrentStep(1);
    const interval = setInterval(() => {
      step = step < 4 ? step + 1 : 4; 
      setCurrentStep(step);
    }, 4000); 

    try {
      const data = await analyseDeck(file);
      clearInterval(interval);
      setCurrentStep(5);
      setLiveReport(data);
      
      // Short delay so the user sees the final "Done" state
      setTimeout(() => navigate(`/report/${data.report_id}`), 1000);
      
    } catch (err) {
      clearInterval(interval);
      console.error("Upload error:", err);
      setUploadError(err.response?.data?.detail || "Analysis failed. Ensure the backend is running.");
      navigate('/');
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
      <Route path="/" element={<UploadPage onUpload={handleUpload} error={uploadError} />} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function ReportRouteWrapper({ liveReport, activeSection, handleNavigate }) {
  const { id } = useParams();
  const [reportData, setReportData] = useState(liveReport);
  const [loading, setLoading] = useState(!liveReport && id);

  useEffect(() => {
    if (!liveReport && id) {
      setLoading(true);
      getReport(id)
        .then(data => {
          setReportData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch report:", err);
          setLoading(false);
        });
    }
  }, [id, liveReport]);

  if (loading) {
    return <div className="min-h-screen bg-[#08090a] flex items-center justify-center text-[#8a8f98]">Loading report...</div>;
  }

  return (
    <ReportPage 
      report={reportData || mockReport}
      filename={reportData ? reportData.file_name : "Pitch-Example-Air-BnB-PDF.pdf"}
      activeSection={activeSection}
      onNavigate={handleNavigate}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <DealLensFlow />
    </BrowserRouter>
  );
}

export default App;
