import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import LoadingPage from './pages/LoadingPage';
import ReportPage from './pages/ReportPage';
import { mockReport } from './data/mockReport';

function DealLensFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSection, setActiveSection] = useState('scorecard');

  // Simulated upload and loading flow
  const handleUpload = (file) => {
    console.log("Uploaded file:", file.name);
    navigate('/loading');
    
    // Simulate the 5 steps taking a bit of time each
    let step = 1;
    const interval = setInterval(() => {
      step += 1;
      if (step > 5) {
        clearInterval(interval);
        navigate('/report');
      } else {
        setCurrentStep(step);
      }
    }, 1500); // 1.5s per step for preview purposes
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
      <Route path="/" element={<UploadPage onUpload={handleUpload} />} />
      <Route path="/loading" element={<LoadingPage currentStep={currentStep} />} />
      <Route 
        path="/report" 
        element={
          <ReportPage 
            report={mockReport} 
            filename="Pitch-Example-Air-BnB-PDF.pdf"
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
