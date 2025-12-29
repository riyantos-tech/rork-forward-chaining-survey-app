import { Tabs } from 'expo-router';
import { FileText, GitBranch, Target, LogOut } from 'lucide-react-native';
import { TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#667eea',
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <LogOut color="#667eea" size={22} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="premises"
        options={{
          title: 'Premises',
          tabBarIcon: ({ color }) => <FileText color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: 'Rules',
          tabBarIcon: ({ color }) => <GitBranch color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="subgoals"
        options={{
          title: 'Subgoals',
          tabBarIcon: ({ color }) => <Target color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
