import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, History, Download } from 'lucide-react-native';

export default function UserHomeScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Selamat Datang</Text>
        <Text style={styles.userName}>{currentUser?.username}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push('/(user)/survey')}
        >
          <View style={styles.iconContainer}>
            <ClipboardList color="#fff" size={32} />
          </View>
          <Text style={styles.menuTitle}>Tentukan Kebutuhan</Text>
          <Text style={styles.menuSubtitle}>Dapatkan rekomendasi berdasarkan kebutuhan Anda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push('/(user)/history')}
        >
          <View style={[styles.iconContainer, styles.iconContainerHistory]}>
            <History color="#fff" size={32} />
          </View>
          <Text style={styles.menuTitle}>Riwayat</Text>
          <Text style={styles.menuSubtitle}>Lihat riwayat rekomendasi Anda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => router.push('/(user)/download')}
        >
          <View style={[styles.iconContainer, styles.iconContainerDownload]}>
            <Download color="#fff" size={32} />
          </View>
          <Text style={styles.menuTitle}>Download</Text>
          <Text style={styles.menuSubtitle}>Export laporan dalam format PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  menuContainer: {
    padding: 20,
    gap: 16,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconContainerHistory: {
    backgroundColor: '#4f46e5',
  },
  iconContainerDownload: {
    backgroundColor: '#6366f1',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
