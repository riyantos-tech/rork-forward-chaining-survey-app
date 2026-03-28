import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSurvey } from '@/contexts/SurveyContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Circle } from 'lucide-react-native';

export default function SurveyScreen() {
  const { logic, submitSurvey, isSubmitting } = useSurvey();
  const { currentUser } = useAuth();
  const [responses, setResponses] = useState<Record<string, any>>({});

  const premises = useMemo(() => logic?.premises || [], [logic]);

  const handleBooleanChange = (premiseId: string, value: boolean) => {
    setResponses(prev => ({ ...prev, [premiseId]: value }));
  };

  const handleTextChange = (premiseId: string, value: string) => {
    setResponses(prev => ({ ...prev, [premiseId]: value }));
  };

  const handleNumberChange = (premiseId: string, value: string) => {
    const numValue = value === '' ? '' : Number(value);
    setResponses(prev => ({ ...prev, [premiseId]: numValue }));
  };

  const handleSubmit = async () => {
    if (premises.length === 0) {
      Alert.alert('Tidak Ada Pertanyaan', 'Admin belum membuat pertanyaan');
      return;
    }

    const allAnswered = premises.every(p => responses[p.id] !== undefined && responses[p.id] !== '');
    
    if (!allAnswered) {
      Alert.alert('Belum Lengkap', 'Harap jawab semua pertanyaan');
      return;
    }

    try {
      const survey = await submitSurvey({ userId: currentUser!.id, responses });
      Alert.alert('Berhasil', `Rekomendasi: ${survey.result}`);
      setResponses({});
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    }
  };

  if (!logic || premises.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Tidak Ada Pertanyaan</Text>
        <Text style={styles.emptyText}>Admin belum membuat pertanyaan. Silakan cek lagi nanti.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tentukan Kebutuhan</Text>
      <Text style={styles.subtitle}>Jawab semua pertanyaan untuk mendapatkan rekomendasi</Text>

      {premises.map((premise, index) => (
        <View key={premise.id} style={styles.questionCard}>
          <Text style={styles.questionNumber}>Pertanyaan {index + 1}</Text>
          <Text style={styles.questionText}>{premise.question}</Text>

          {premise.type === 'boolean' && (
            <View style={styles.booleanContainer}>
              <TouchableOpacity
                style={styles.booleanOption}
                onPress={() => handleBooleanChange(premise.id, true)}
              >
                {responses[premise.id] === true ? (
                  <CheckCircle2 color="#667eea" size={24} />
                ) : (
                  <Circle color="#ccc" size={24} />
                )}
                <Text style={[styles.booleanText, responses[premise.id] === true && styles.booleanTextActive]}>
                  Ya
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.booleanOption}
                onPress={() => handleBooleanChange(premise.id, false)}
              >
                {responses[premise.id] === false ? (
                  <CheckCircle2 color="#667eea" size={24} />
                ) : (
                  <Circle color="#ccc" size={24} />
                )}
                <Text style={[styles.booleanText, responses[premise.id] === false && styles.booleanTextActive]}>
                  Tidak
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {premise.type === 'text' && (
            <TextInput
              style={styles.textInput}
              placeholder="Ketik jawaban Anda"
              value={responses[premise.id] || ''}
              onChangeText={(text) => handleTextChange(premise.id, text)}
            />
          )}

          {premise.type === 'number' && (
            <TextInput
              style={styles.textInput}
              placeholder="Masukkan angka"
              value={responses[premise.id]?.toString() || ''}
              onChangeText={(text) => handleNumberChange(premise.id, text)}
              keyboardType="numeric"
            />
          )}
        </View>
      ))}

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Mengirim...' : 'Dapatkan Rekomendasi'}
        </Text>
      </TouchableOpacity>
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
  questionCard: {
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
  questionNumber: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#667eea',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  booleanContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  booleanOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  booleanText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
  },
  booleanTextActive: {
    color: '#667eea',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
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
