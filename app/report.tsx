import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReports } from "./context/ReportsContext";

const { width } = Dimensions.get('window');

// Issue categories
const ISSUE_CATEGORIES = [
  { id: '1', name: 'Road & Infrastructure', icon: 'car-outline' },
  { id: '2', name: 'Water & Sanitation', icon: 'water-outline' },
  { id: '3', name: 'Electricity', icon: 'flash-outline' },
  { id: '4', name: 'Public Safety', icon: 'shield-outline' },
  { id: '5', name: 'Waste Management', icon: 'trash-outline' },
  { id: '6', name: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function ReportScreen() {
  const { addReport } = useReports();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [address, setAddress] = useState<string>("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();

  const takePhoto = async () => {
    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus !== "granted") {
      Alert.alert("Permission Required", "Camera permission is required to take photos.");
      return;
    }

    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    if (locStatus !== "granted") {
      Alert.alert("Permission Required", "Location permission is required to tag your report.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        
        // Get address from coordinates
        const addressData = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        
        if (addressData[0]) {
          const addr = `${addressData[0].street || ''} ${addressData[0].city || ''} ${addressData[0].region || ''}`.trim();
          setAddress(addr);
        }
      } catch (error) {
        console.error("Location error:", error);
        Alert.alert("Location Error", "Could not get current location. Please try again.");
      }
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Microphone access is needed for voice notes.");
        return;
      }

      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true 
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setRecordingDuration(0);
      
      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Start recording error:", err);
      Alert.alert("Error", "Could not start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setVoiceUri(uri ?? null);
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Stop recording error:", error);
    }
  };

  const playVoice = async () => {
    if (!voiceUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: voiceUri });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error("Play voice error:", error);
    }
  };

  const deleteVoiceNote = () => {
    Alert.alert(
      "Delete Voice Note",
      "Are you sure you want to delete this voice note?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => setVoiceUri(null) }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitReport = async () => {
    if (!image) {
      Alert.alert("Missing Photo", "Please take a photo of the issue.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please provide a title for the issue.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Missing Description", "Please describe the issue.");
      return;
    }
    if (!category) {
      Alert.alert("Missing Category", "Please select a category for the issue.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Add the report to context
      addReport({
        user: "You", // You can make this dynamic with user auth
        issue: title,
        title: title,
        location: address ? address.split(',')[0] : "Unknown Location",
        address: address || "Address not available",
        image: image,
        category: category,
        description: description,
        voiceNote: voiceUri || undefined,
        coords: coords || undefined,
      });

      // Simulate API call delay
      setTimeout(() => {
        setIsSubmitting(false);
        Alert.alert(
          "Report Submitted Successfully! ✅",
          `Your civic issue report has been submitted and will be reviewed by local authorities.\n\nTitle: ${title}\nCategory: ${category}\nLocation: ${address || 'Location not available'}`,
          [
            {
              text: "View in Feed",
              onPress: () => {
                // Reset form
                setImage(null);
                setTitle("");
                setDescription("");
                setCategory("");
                setCoords(null);
                setAddress("");
                setVoiceUri(null);
                // Navigate back to home
                router.push('/');
              }
            }
          ]
        );
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(
              (image ? 25 : 0) + 
              (title ? 25 : 0) + 
              (description ? 25 : 0) + 
              (category ? 25 : 0)
            )}%` }]} />
          </View>
          <Text style={styles.progressText}>Complete all fields to submit</Text>
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Evidence *</Text>
          {image ? (
            <View style={styles.imageContainer}>
              <ImageBackground source={{ uri: image }} style={styles.preview}>
                <View style={styles.imageActions}>
                  <TouchableOpacity style={styles.imageActionButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.imageActionButton, styles.deleteButton]} 
                    onPress={() => setImage(null)}
                  >
                    <Ionicons name="trash" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                {coords && (
                  <View style={styles.overlay}>
                    <Ionicons name="location" size={16} color="white" />
                    <Text style={styles.overlayText}>
                      Location: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                    </Text>
                  </View>
                )}
              </ImageBackground>
              {address ? (
                <Text style={styles.addressText}>📍 {address}</Text>
              ) : null}
            </View>
          ) : (
            <TouchableOpacity style={styles.photoPlaceholder} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={48} color="#999" />
              <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
              <Text style={styles.photoSubText}>Camera will auto-capture location</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Brief title (e.g., Pothole on Main Street)"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {ISSUE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  category === cat.name && styles.categoryCardActive
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={24} 
                  color={category === cat.name ? "white" : "#007b55"} 
                />
                <Text style={[
                  styles.categoryText,
                  category === cat.name && styles.categoryTextActive
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the issue in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Voice Note Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Note (Optional)</Text>
          
          {!recording && !voiceUri && (
            <TouchableOpacity style={styles.voiceButton} onPress={startRecording}>
              <Ionicons name="mic-outline" size={24} color="#007b55" />
              <Text style={styles.voiceButtonText}>Add Voice Note</Text>
            </TouchableOpacity>
          )}

          {recording && (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording... {formatTime(recordingDuration)}</Text>
              </View>
              <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                <Ionicons name="stop" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {voiceUri && (
            <View style={styles.voiceNoteContainer}>
              <TouchableOpacity style={styles.playButton} onPress={playVoice}>
                <Ionicons name="play" size={20} color="#007b55" />
                <Text style={styles.voiceNoteText}>Voice Note Added</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteVoiceButton} onPress={deleteVoiceNote}>
                <Ionicons name="trash-outline" size={18} color="#ff4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={submitReport}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#007b55',
    borderBottomWidth: 1,
    borderBottomColor: '#00695c',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007b55',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: 'center',
  },
  preview: {
    width: width - 32,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: 'space-between',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
  },
  imageActionButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,68,68,0.8)',
  },
  overlay: {
    backgroundColor: "rgba(0, 123, 85, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  addressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  photoPlaceholder: {
    height: 160,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  photoSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryScroll: {
    marginVertical: 4,
  },
  categoryCard: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: 90,
  },
  categoryCardActive: {
    backgroundColor: '#007b55',
    borderColor: '#007b55',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    color: '#666',
  },
  categoryTextActive: {
    color: 'white',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 100,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#007b55',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f8fffe',
  },
  voiceButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007b55',
    fontWeight: '500',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: '#ff4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#d1eddb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceNoteText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#155724',
    fontWeight: '500',
  },
  deleteVoiceButton: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: '#007b55',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#007b55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 40,
  },
});