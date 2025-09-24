// database/ReportsDB.ts
import * as SQLite from 'expo-sqlite';
import { ReportItem } from '../context/ReportsContext';

let db: SQLite.SQLiteDatabase;

export class ReportsDB {
  static async initDatabase(): Promise<void> {
    try {
      // Open database with new API
      db = await SQLite.openDatabaseAsync('civic_reports.db');
      
      // Create reports table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          user_name TEXT NOT NULL,
          title TEXT NOT NULL,
          issue TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          location TEXT NOT NULL,
          address TEXT NOT NULL,
          image_uri TEXT NOT NULL,
          voice_note_uri TEXT,
          latitude REAL,
          longitude REAL,
          upvotes INTEGER DEFAULT 0,
          status TEXT DEFAULT 'reported',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);

      // Create user_votes table to track votes
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          voted_at INTEGER NOT NULL,
          UNIQUE(report_id, user_id)
        );
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  static async addReport(report: Omit<ReportItem, 'id' | 'upvotes' | 'status' | 'timestamp' | 'dateCreated'>): Promise<string> {
    try {
      const reportId = Date.now().toString();
      const now = Date.now();
      
      await db.runAsync(
        `INSERT INTO reports (
          id, user_name, title, issue, description, category, 
          location, address, image_uri, voice_note_uri, 
          latitude, longitude, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reportId,
          report.user,
          report.title,
          report.issue,
          report.description,
          report.category,
          report.location,
          report.address,
          report.image,
          report.voiceNote || null,
          report.coords?.lat || null,
          report.coords?.lon || null,
          now,
          now
        ]
      );
      
      console.log('Report added successfully:', reportId);
      return reportId;
    } catch (error) {
      console.error('Error adding report:', error);
      throw error;
    }
  }

  static async getAllReports(): Promise<ReportItem[]> {
    try {
      const rows = await db.getAllAsync(`SELECT * FROM reports ORDER BY created_at DESC`);
      const reports: ReportItem[] = [];
      
      for (const row of rows as any[]) {
        reports.push({
          id: row.id,
          user: row.user_name,
          title: row.title,
          issue: row.issue,
          description: row.description,
          category: row.category,
          location: row.location,
          address: row.address,
          image: row.image_uri,
          voiceNote: row.voice_note_uri,
          coords: row.latitude && row.longitude ? {
            lat: row.latitude,
            lon: row.longitude
          } : undefined,
          upvotes: row.upvotes,
          status: row.status as 'reported' | 'in-progress' | 'resolved',
          timestamp: this.getTimeAgo(new Date(row.created_at)),
          dateCreated: new Date(row.created_at),
        });
      }
      
      return reports;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  static async updateReportVotes(reportId: string, newVoteCount: number): Promise<void> {
    try {
      await db.runAsync(
        `UPDATE reports SET upvotes = ?, updated_at = ? WHERE id = ?`,
        [newVoteCount, Date.now(), reportId]
      );
      
      console.log('Report votes updated:', reportId, newVoteCount);
    } catch (error) {
      console.error('Error updating votes:', error);
      throw error;
    }
  }

  static async addUserVote(reportId: string, userId: string = 'default_user'): Promise<void> {
    try {
      await db.runAsync(
        `INSERT OR IGNORE INTO user_votes (report_id, user_id, voted_at) VALUES (?, ?, ?)`,
        [reportId, userId, Date.now()]
      );
      
      console.log('User vote added:', reportId, userId);
    } catch (error) {
      console.error('Error adding user vote:', error);
      throw error;
    }
  }

  static async getUserVotes(userId: string = 'default_user'): Promise<Set<string>> {
    try {
      const rows = await db.getAllAsync(
        `SELECT report_id FROM user_votes WHERE user_id = ?`,
        [userId]
      );
      
      const votedReports = new Set<string>();
      
      for (const row of rows as any[]) {
        votedReports.add(row.report_id);
      }
      
      return votedReports;
    } catch (error) {
      console.error('Error fetching user votes:', error);
      return new Set();
    }
  }

  static async updateReportStatus(reportId: string, status: 'reported' | 'in-progress' | 'resolved'): Promise<void> {
    try {
      await db.runAsync(
        `UPDATE reports SET status = ?, updated_at = ? WHERE id = ?`,
        [status, Date.now(), reportId]
      );
      
      console.log('Report status updated:', reportId, status);
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMs < 60000) return 'Just now';
    if (diffInMs < 3600000) return `${Math.floor(diffInMs / 60000)} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }

  // Helper method to clear all data (for testing)
  static async clearAllData(): Promise<void> {
    try {
      await db.execAsync(`
        DELETE FROM reports;
        DELETE FROM user_votes;
      `);
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}