import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SurveyProvider } from "@/contexts/SurveyContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { currentUser, isReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    const inAuth = segments[0] === '(auth)';
    const inUser = segments[0] === '(user)';
    const inAdmin = segments[0] === '(admin)';

    if (!currentUser && !inAuth) {
      router.replace('/(auth)/login');
    } else if (currentUser) {
      if (currentUser.role === 'admin' && !inAdmin) {
        router.replace('/(admin)/premises');
      } else if (currentUser.role === 'user' && !inUser) {
        router.replace('/(user)');
      }
    }
  }, [currentUser, segments, isReady, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Kembali" }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <SurveyProvider>
              <RootLayoutNav />
            </SurveyProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
