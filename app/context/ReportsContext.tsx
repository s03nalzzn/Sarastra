// contexts/ReportsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReportsDB } from '../database/ReportsDB';

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
  addReport: (report: Omit<ReportItem, 'id' | 'upvotes' | 'status' | 'timestamp' | 'dateCreated'>) => Promise<void>;
  updateReportVotes: (reportId: string) => Promise<void>;
  userVotes: Set<string>;
  isLoading: boolean;
  refreshReports: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Mock initial data - will be replaced by database data
const initialMockReports: ReportItem[] = [
  {
    id: "mock1",
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
    dateCreated: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "mock2",
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
    dateCreated: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

export const ReportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database and load data on app start
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🔄 Initializing app...');
      setIsLoading(true);
      
      // Initialize database
      await ReportsDB.initDatabase();
      console.log('✅ Database initialized');
      
      // Load existing reports from database
      await loadReports();
      
      // Load user votes
      await loadUserVotes();
      
      setIsInitialized(true);
      console.log('✅ App initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      // Fallback to mock data if database fails
      console.log('🔄 Using mock data as fallback');
      setReports(initialMockReports);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      console.log('🔄 Loading reports from database...');
      const dbReports = await ReportsDB.getAllReports();
      console.log(`✅ Loaded ${dbReports.length} reports from database`);
      
      // If no reports in database, add initial mock data
      if (dbReports.length === 0) {
        console.log('📝 No reports found, adding initial mock data...');
        for (const mockReport of initialMockReports) {
          await ReportsDB.addReport(mockReport);
        }
        // Reload after adding mock data
        const updatedReports = await ReportsDB.getAllReports();
        setReports(updatedReports);
        console.log(`✅ Added ${updatedReports.length} initial reports`);
      } else {
        setReports(dbReports);
      }
    } catch (error) {
      console.error('❌ Failed to load reports:', error);
      // Fallback to empty array
      setReports([]);
    }
  };

  const loadUserVotes = async () => {
    try {
      const votes = await ReportsDB.getUserVotes();
      setUserVotes(votes);
      console.log(`✅ Loaded ${votes.size} user votes`);
    } catch (error) {
      console.error('❌ Failed to load user votes:', error);
      setUserVotes(new Set());
    }
  };

  const addReport = async (newReport: Omit<ReportItem, 'id' | 'upvotes' | 'status' | 'timestamp' | 'dateCreated'>) => {
    try {
      console.log('💾 Saving report to database...', newReport.title);
      
      // Add to database first
      const reportId = await ReportsDB.addReport(newReport);
      console.log('✅ Report saved to database with ID:', reportId);
      
      // Create the report object for immediate UI update
      const report: ReportItem = {
        ...newReport,
        id: reportId,
        upvotes: 0,
        status: 'reported',
        timestamp: 'Just now',
        dateCreated: new Date(),
      };

      // Update local state immediately for better UX
      setReports(prevReports => [report, ...prevReports]);
      console.log('✅ Report added to local state');
      
    } catch (error) {
      console.error('❌ Failed to add report:', error);
      throw error;
    }
  };

  const updateReportVotes = async (reportId: string) => {
    if (userVotes.has(reportId)) {
      console.log('⚠️ User already voted for report:', reportId);
      return; // Already voted
    }

    try {
      // Find the report to get current vote count
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        console.log('⚠️ Report not found:', reportId);
        return;
      }

      const newVoteCount = report.upvotes + 1;
      console.log('🗳️ Updating vote count for report:', reportId, 'New count:', newVoteCount);

      // Update database
      await ReportsDB.updateReportVotes(reportId, newVoteCount);
      await ReportsDB.addUserVote(reportId);
      console.log('✅ Vote updated in database');

      // Update local state
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId
            ? { ...report, upvotes: newVoteCount }
            : report
        )
      );
      
      setUserVotes(prev => new Set([...prev, reportId]));
      console.log('✅ Vote updated in local state');
      
    } catch (error) {
      console.error('❌ Failed to update votes:', error);
    }
  };

  const refreshReports = async () => {
    console.log('🔄 Refreshing reports...');
    await loadReports();
    await loadUserVotes();
    console.log('✅ Reports refreshed');
  };

  const value = {
    reports,
    addReport,
    updateReportVotes,
    userVotes,
    isLoading,
    refreshReports,
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