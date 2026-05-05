import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import LoadingPage from './pages/LoadingPage';
import ReportPage from './pages/ReportPage';
import { mockReport } from './data/mockReport';
import { analyseDeck } from './api/analyse';

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
      setTimeout(() => navigate('/report'), 1000);
      
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
        path="/report" 
        element={
          <ReportPage 
            report={liveReport || mockReport} // Fallback to mockReport if directly navigated for testing
            filename={liveReport ? liveReport.file_name : "Pitch-Example-Air-BnB-PDF.pdf"}
            activeSection={activeSection}
            onNavigate={handleNavigate}
          />
        } 
      />
    </Routes>
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
