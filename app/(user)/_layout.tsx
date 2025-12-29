import { Stack } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function UserLayout() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <LogOut color="#667eea" size={22} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Menu Utama',
        }}
      />
      <Stack.Screen
        name="survey"
        options={{
          title: 'Tentukan Kebutuhan',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Riwayat',
        }}
      />
      <Stack.Screen
        name="download"
        options={{
          title: 'Download',
        }}
      />
    </Stack>
  );
}
