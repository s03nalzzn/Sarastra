// contexts/ReportsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ReportItem = {
  id: string;
  user: string;
  issue: string;
  title: string;
  location: string;
  address: string;
  image: string;
  upvotes: number;
  status: 'reported' | 'in-progress' | 'resolved';
  timestamp: string;
  category: string;
  description: string;
  voiceNote?: string;
  coords?: { lat: number; lon: number };
  dateCreated: Date;
};

interface ReportsContextType {
  reports: ReportItem[];
  addReport: (report: Omit<ReportItem, 'id' | 'upvotes' | 'status' | 'timestamp' | 'dateCreated'>) => void;
  updateReportVotes: (reportId: string) => void;
  userVotes: Set<string>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Mock initial data
const initialReports: ReportItem[] = [
  {
    id: "1",
    user: "Amit",
    issue: "Pothole near main road",
    title: "Pothole near main road",
    location: "Sector 14",
    address: "Main Road, Sector 14, Delhi",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    upvotes: 12,
    status: 'reported',
    timestamp: '2 hours ago',
    category: 'Road & Infrastructure',
    description: "Large pothole causing traffic issues and vehicle damage",
    dateCreated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "2",
    user: "Priya",
    issue: "Streetlight not working",
    title: "Streetlight not working",
    location: "Sector 21",
    address: "Park Avenue, Sector 21, Delhi",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400",
    upvotes: 8,
    status: 'in-progress',
    timestamp: '5 hours ago',
    category: 'Public Safety',
    description: "Street light has been non-functional for over a week",
    dateCreated: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: "3",
    user: "Rahul",
    issue: "Water pipeline burst",
    title: "Water pipeline burst",
    location: "Sector 18",
    address: "Water Works Road, Sector 18, Delhi",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    upvotes: 25,
    status: 'resolved',
    timestamp: '1 day ago',
    category: 'Water & Sanitation',
    description: "Main water pipeline burst causing flooding",
    dateCreated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export const ReportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  const addReport = (newReport: Omit<ReportItem, 'id' | 'upvotes' | 'status' | 'timestamp' | 'dateCreated'>) => {
    const report: ReportItem = {
      ...newReport,
      id: Date.now().toString(),
      upvotes: 0,
      status: 'reported',
      timestamp: 'Just now',
      dateCreated: new Date(),
    };

    setReports(prevReports => [report, ...prevReports]);
  };

  const updateReportVotes = (reportId: string) => {
    if (userVotes.has(reportId)) {
      return; // Already voted
    }

    setReports(prevReports =>
      prevReports.map(report =>
        report.id === reportId
          ? { ...report, upvotes: report.upvotes + 1 }
          : report
      )
    );
    
    setUserVotes(prev => new Set([...prev, reportId]));
  };

  const value = {
    reports,
    addReport,
    updateReportVotes,
    userVotes,
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};