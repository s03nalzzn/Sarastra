import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReports } from "../context/ReportsContext";
import HeroesScreen from "./heroes"; // Import the heroes screen

export default function HomeScreen() {
  const { reports, updateReportVotes, userVotes } = useReports();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'heroes'>('home');
  const insets = useSafeAreaInsets();

  const handleUpvote = (itemId: string) => {
    if (userVotes.has(itemId)) {
      Alert.alert("Already Voted", "You have already upvoted this issue!");
      return;
    }
    updateReportVotes(itemId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simple refresh - you can add more logic here if needed
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return '#ff6b35';
      case 'in-progress':
        return '#ffa726';
      case 'resolved':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reported':
        return 'alert-circle';
      case 'in-progress':
        return 'time';
      case 'resolved':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const getTimeAgo = (dateCreated: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - dateCreated.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMs < 60000) return 'Just now';
    if (diffInMs < 3600000) return `${Math.floor(diffInMs / 60000)} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const renderFeedItem = ({ item }: { item: any }) => (
    <View style={styles.feedCard}>
      {/* Header with user and timestamp */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user[0]}</Text>
          </View>
          <View>
            <Text style={styles.username}>{item.user}</Text>
            <Text style={styles.timestamp}>{getTimeAgo(item.dateCreated)}</Text>
          </View>
        </View>
        
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={12} 
            color="white" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status.replace('-', ' ')}</Text>
        </View>
      </View>

      {/* Issue image */}
      <Image 
        source={{ uri: item.image }} 
        style={styles.feedImage}
        onError={() => console.log('Image failed to load')}
      />

      {/* Issue content */}
      <View style={styles.cardContent}>
        <Text style={styles.issue}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.metaInfo}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.location}>{item.address || item.location}</Text>
          </View>
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag" size={14} color="#007b55" />
            <Text style={styles.category}>{item.category}</Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[
            styles.upvoteButton,
            userVotes.has(item.id) && styles.upvoteButtonActive
          ]}
          onPress={() => handleUpvote(item.id)}
        >
          <Ionicons 
            name={userVotes.has(item.id) ? "arrow-up" : "arrow-up-outline"} 
            size={16} 
            color={userVotes.has(item.id) ? "#007b55" : "#666"} 
          />
          <Text style={[
            styles.upvoteText,
            userVotes.has(item.id) && styles.upvoteTextActive
          ]}>
            {item.upvotes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={16} color="#666" />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.commentButton}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.commentText}>Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const HomeTab = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello Civic Reporter!</Text>
          <Text style={styles.subGreeting}>Make your city better</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={32} color="#007b55" />
        </TouchableOpacity>
      </View>

      {/* Report Button */}
      <Link href="/report" asChild>
        <TouchableOpacity style={styles.reportButton}>
          <Ionicons name="camera" size={20} color="white" style={styles.reportIcon} />
          <Text style={styles.reportText}>Report an Issue</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </Link>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total Issues</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reports.filter(item => item.status === 'resolved').length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reports.filter(item => item.status === 'in-progress').length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
      </View>

      {/* Feed Section */}
      <View style={styles.feedHeader}>
        <Text style={styles.feedHeading}>📢 Community Feed</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={20} color="#007b55" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007b55"]}
          />
        }
      />
    </View>
  );

  return (
    <View style={[{ flex: 1 }, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Tab Content */}
      {currentTab === 'home' && <HomeTab />}
      {currentTab === 'heroes' && <HeroesScreen />}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'home' && styles.activeNavItem]}
          onPress={() => setCurrentTab('home')}
        >
          <Ionicons 
            name={currentTab === 'home' ? 'home' : 'home-outline'} 
            size={24} 
            color={currentTab === 'home' ? '#007b55' : '#666'} 
          />
          <Text style={[styles.navText, currentTab === 'home' && styles.activeNavText]}>
            Issues
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navItem, currentTab === 'heroes' && styles.activeNavItem]}
          onPress={() => setCurrentTab('heroes')}
        >
          <Text style={[
            styles.heroEmoji, 
            currentTab === 'heroes' && styles.heroEmojiActive
          ]}>
            🦸‍♂️
          </Text>
          <Text style={[styles.navText, currentTab === 'heroes' && styles.activeNavText]}>
            Heroes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007b55",
  },
  subGreeting: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  reportButton: {
    backgroundColor: "#007b55",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: "#007b55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reportIcon: {
    marginRight: 8,
  },
  reportText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007b55',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feedHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  feedContainer: {
    paddingBottom: 20,
  },
  feedCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007b55',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  feedImage: {
    width: "100%",
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
  },
  issue: {
    fontSize: 16,
    fontWeight: '600',
    color: "#333",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    color: "#666",
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    color: "#007b55",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  upvoteButtonActive: {
    backgroundColor: '#e8f5e8',
  },
  upvoteText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  upvoteTextActive: {
    color: '#007b55',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  shareText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  commentText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    // Active state handled by icon and text color
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#007b55',
    fontWeight: '500',
  },
  heroEmoji: {
    fontSize: 24,
  },
  heroEmojiActive: {
    fontSize: 26,
  },
});