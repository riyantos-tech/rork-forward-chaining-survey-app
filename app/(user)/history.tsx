import { useMemo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSurvey } from '@/contexts/SurveyContext';
import { Survey } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Target } from 'lucide-react-native';

export default function HistoryScreen() {
  const { surveys, refetchSurveys } = useSurvey();
  const { currentUser } = useAuth();

  const userSurveys = useMemo(() => {
    return surveys.filter((s: Survey) => s.userId === currentUser?.id).sort((a: Survey, b: Survey) => b.timestamp - a.timestamp);
  }, [surveys, currentUser]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (userSurveys.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
        <Text style={styles.emptyText}>Anda belum mengisi survey. Mulai isi survey untuk melihat riwayat.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => refetchSurveys()} />
      }
    >
      <Text style={styles.title}>Riwayat Survey</Text>
      <Text style={styles.subtitle}>{userSurveys.length} survey terisi</Text>

      {userSurveys.map((survey: Survey) => (
        <View key={survey.id} style={styles.surveyCard}>
          <View style={styles.surveyHeader}>
            <View style={styles.dateContainer}>
              <Calendar color="#667eea" size={16} />
              <Text style={styles.dateText}>{formatDate(survey.timestamp)}</Text>
            </View>
          </View>

          <View style={styles.resultContainer}>
            <Target color="#667eea" size={20} />
            <Text style={styles.resultLabel}>Hasil:</Text>
            <Text style={styles.resultText}>{survey.result}</Text>
          </View>

          <View style={styles.responsesContainer}>
            <Text style={styles.responsesTitle}>Jawaban:</Text>
            {Object.entries(survey.responses).map(([key, value], index): ReactNode => (
              <View key={key} style={styles.responseItem}>
                <Text style={styles.responseKey}>
                  {index + 1}. {typeof value === 'boolean' ? (value ? 'Ya' : 'Tidak') : value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  surveyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  surveyHeader: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f3ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#667eea',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    flex: 1,
  },
  responsesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  responsesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 12,
  },
  responseItem: {
    marginBottom: 8,
  },
  responseKey: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
