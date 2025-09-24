/*import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};


export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}*/
// app/_layout.tsx
/*import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ReportsProvider } from './context/ReportsContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ReportsProvider>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
              title: 'Home' 
            }} 
          />
          <Stack.Screen 
            name="report" 
            options={{ 
              headerShown: false,
              title: 'Report Issue' 
            }} 
          />
        </Stack>
      </ReportsProvider>
    </SafeAreaProvider>
  );
}*/
// app/_layout.tsx
import { Stack } from 'expo-router';
import { ReportsProvider } from './context/ReportsContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ReportsProvider>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
              title: 'Home' 
            }} 
          />
          <Stack.Screen 
            name="report" 
            options={{ 
              headerShown: false,
              title: 'Report Issue' 
            }} 
          />
          <Stack.Screen 
            name="heroes" 
            options={{ 
              headerShown: false,
              title: 'Heroes' 
            }} 
          />
        </Stack>
      </ReportsProvider>
    </SafeAreaProvider>
  );
}



