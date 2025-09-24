import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock data - your teammates will replace this with real backend data
type Hero = {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  score: number;
  reportsCount: number;
  upvotesReceived: number;
  upvotesGiven: number;
  resolvedIssues: number;
  joinedDate: string;
  badge?: 'gold' | 'silver' | 'bronze';
  trend: 'up' | 'down' | 'same';
};

// Mock heroes data - replace with API call
const mockHeroes: Hero[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rank: 1,
    score: 2450,
    reportsCount: 28,
    upvotesReceived: 342,
    upvotesGiven: 156,
    resolvedIssues: 24,
    joinedDate: 'Jan 2024',
    badge: 'gold',
    trend: 'up',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b669d494?w=150',
    rank: 2,
    score: 2180,
    reportsCount: 22,
    upvotesReceived: 298,
    upvotesGiven: 134,
    resolvedIssues: 19,
    joinedDate: 'Feb 2024',
    badge: 'silver',
    trend: 'up',
  },
  {
    id: '3',
    name: 'Amit Singh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rank: 3,
    score: 1920,
    reportsCount: 19,
    upvotesReceived: 245,
    upvotesGiven: 112,
    resolvedIssues: 16,
    joinedDate: 'Mar 2024',
    badge: 'bronze',
    trend: 'same',
  },
  {
    id: '4',
    name: 'Sneha Patel',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    rank: 4,
    score: 1650,
    reportsCount: 15,
    upvotesReceived: 189,
    upvotesGiven: 98,
    resolvedIssues: 12,
    joinedDate: 'Apr 2024',
    trend: 'up',
  },
  {
    id: '5',
    name: 'Vikram Yadav',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rank: 5,
    score: 1420,
    reportsCount: 12,
    upvotesReceived: 156,
    upvotesGiven: 87,
    resolvedIssues: 10,
    joinedDate: 'May 2024',
    trend: 'down',
  },
  {
    id: '6',
    name: 'Neha Gupta',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
    rank: 6,
    score: 1280,
    reportsCount: 11,
    upvotesReceived: 134,
    upvotesGiven: 76,
    resolvedIssues: 8,
    joinedDate: 'Jun 2024',
    trend: 'up',
  },
];

export default function HeroesScreen() {
  const [heroes, setHeroes] = useState<Hero[]>(mockHeroes);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const insets = useSafeAreaInsets();

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return '#007b55';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'same': return 'remove';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      case 'same': return '#FF9800';
      default: return '#999';
    }
  };

  const TopThreeHeroes = () => (
    <View style={styles.topThreeContainer}>
      {/* 2nd Place */}
      <View style={[styles.podiumCard, styles.secondPlace]}>
        <View style={styles.podiumRank}>
          <Text style={styles.medalText}>🥈</Text>
        </View>
        <Image source={{ uri: heroes[1].avatar }} style={styles.podiumAvatar} />
        <Text style={styles.podiumName}>{heroes[1].name}</Text>
        <Text style={styles.podiumScore}>{heroes[1].score} pts</Text>
        <View style={styles.podiumStats}>
          <Text style={styles.podiumStatText}>{heroes[1].reportsCount} reports</Text>
          <Text style={styles.podiumStatText}>{heroes[1].upvotesReceived} upvotes</Text>
        </View>
      </View>

      {/* 1st Place */}
      <View style={[styles.podiumCard, styles.firstPlace]}>
        <View style={styles.crownContainer}>
          <Text style={styles.crownText}>👑</Text>
        </View>
        <View style={styles.podiumRank}>
          <Text style={styles.medalText}>🥇</Text>
        </View>
        <Image source={{ uri: heroes[0].avatar }} style={styles.podiumAvatar} />
        <Text style={styles.podiumName}>{heroes[0].name}</Text>
        <Text style={styles.podiumScore}>{heroes[0].score} pts</Text>
        <View style={styles.podiumStats}>
          <Text style={styles.podiumStatText}>{heroes[0].reportsCount} reports</Text>
          <Text style={styles.podiumStatText}>{heroes[0].upvotesReceived} upvotes</Text>
        </View>
        <View style={styles.goldBadge}>
          <Text style={styles.goldBadgeText}>HERO OF THE WEEK</Text>
        </View>
      </View>

      {/* 3rd Place */}
      <View style={[styles.podiumCard, styles.thirdPlace]}>
        <View style={styles.podiumRank}>
          <Text style={styles.medalText}>🥉</Text>
        </View>
        <Image source={{ uri: heroes[2].avatar }} style={styles.podiumAvatar} />
        <Text style={styles.podiumName}>{heroes[2].name}</Text>
        <Text style={styles.podiumScore}>{heroes[2].score} pts</Text>
        <View style={styles.podiumStats}>
          <Text style={styles.podiumStatText}>{heroes[2].reportsCount} reports</Text>
          <Text style={styles.podiumStatText}>{heroes[2].upvotesReceived} upvotes</Text>
        </View>
      </View>
    </View>
  );

  const renderHeroItem = ({ item }: { item: Hero }) => (
    <TouchableOpacity style={styles.heroCard}>
      <View style={styles.heroRank}>
        <Text style={styles.heroRankText}>{getMedalIcon(item.rank)}</Text>
      </View>
      
      <Image source={{ uri: item.avatar }} style={styles.heroAvatar} />
      
      <View style={styles.heroInfo}>
        <View style={styles.heroNameRow}>
          <Text style={styles.heroName}>{item.name}</Text>
          <Ionicons 
            name={getTrendIcon(item.trend)} 
            size={16} 
            color={getTrendColor(item.trend)} 
          />
        </View>
        <Text style={styles.heroScore}>{item.score} points</Text>
        <Text style={styles.heroJoined}>Joined {item.joinedDate}</Text>
      </View>

      <View style={styles.heroStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.reportsCount}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.upvotesReceived}</Text>
          <Text style={styles.statLabel}>Upvotes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.resolvedIssues}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Know Your Heroes</Text>
          <Text style={styles.headerSubtitle}>Top civic contributors</Text>
        </View>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>🦸‍♂️</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'all'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top 3 Heroes Podium */}
        <View style={styles.podiumSection}>
          <Text style={styles.sectionTitle}>🏆 Top Heroes</Text>
          <TopThreeHeroes />
        </View>

        {/* Statistics Overview */}
        <View style={styles.statsOverview}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>{heroes.length}</Text>
            <Text style={styles.overviewLabel}>Active Heroes</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>{heroes.reduce((sum, hero) => sum + hero.reportsCount, 0)}</Text>
            <Text style={styles.overviewLabel}>Total Reports</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>{heroes.reduce((sum, hero) => sum + hero.resolvedIssues, 0)}</Text>
            <Text style={styles.overviewLabel}>Issues Resolved</Text>
          </View>
        </View>

        {/* Full Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>📊 Complete Leaderboard</Text>
          <View style={styles.leaderboardContainer}>
            {heroes.slice(3).map((hero) => (
              <View key={hero.id}>
                {renderHeroItem({ item: hero })}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007b55',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconText: {
    fontSize: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  periodButtonActive: {
    backgroundColor: '#007b55',
    borderColor: '#007b55',
  },
  periodButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  podiumSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 20,
  },
  podiumCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  firstPlace: {
    minHeight: 200,
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  secondPlace: {
    minHeight: 180,
    borderColor: '#C0C0C0',
    borderWidth: 2,
  },
  thirdPlace: {
    minHeight: 160,
    borderColor: '#CD7F32',
    borderWidth: 2,
  },
  crownContainer: {
    position: 'absolute',
    top: -15,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
  },
  crownText: {
    fontSize: 20,
  },
  podiumRank: {
    marginBottom: 8,
  },
  medalText: {
    fontSize: 24,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007b55',
    marginBottom: 8,
  },
  podiumStats: {
    alignItems: 'center',
  },
  podiumStatText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  goldBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 8,
  },
  goldBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007b55',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  leaderboardSection: {
    paddingHorizontal: 20,
  },
  leaderboardContainer: {
    gap: 12,
  },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroRank: {
    width: 40,
    alignItems: 'center',
  },
  heroRankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  heroAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 12,
  },
  heroInfo: {
    flex: 1,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  heroScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007b55',
    marginTop: 2,
  },
  heroJoined: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  heroStats: {
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007b55',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  bottomSpace: {
    height: 40,
  },
});