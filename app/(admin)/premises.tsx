import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSurvey } from '@/contexts/SurveyContext';
import { Premise } from '@/types';
import { Plus, Trash2, HelpCircle } from 'lucide-react-native';

export default function PremisesScreen() {
  const { logic, updateLogic } = useSurvey();
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<'boolean' | 'text' | 'number'>('boolean');

  const premises = logic?.premises || [];

  const handleAdd = async () => {
    if (!name || !question) {
      Alert.alert('Error', 'Nama dan pertanyaan harus diisi');
      return;
    }

    const newPremise: Premise = {
      id: `premise-${Date.now()}`,
      name,
      question,
      type,
    };

    try {
      await updateLogic({
        ...logic!,
        premises: [...premises, newPremise],
      });
      setName('');
      setQuestion('');
      Alert.alert('Berhasil', 'Premise berhasil ditambahkan');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Hapus Premise', 'Yakin ingin menghapus premise ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateLogic({
              ...logic!,
              premises: premises.filter(p => p.id !== id),
              rules: logic!.rules.filter(r => 
                !r.conditions.some(c => c.premiseId === id)
              ),
            });
            Alert.alert('Berhasil', 'Premise berhasil dihapus');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Terjadi kesalahan');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kelola Premises</Text>
      <Text style={styles.subtitle}>Buat pertanyaan survey</Text>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Tambah Premise Baru</Text>

        <TextInput
          style={styles.input}
          placeholder="Nama premise (contoh: HasPhone)"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Pertanyaan (contoh: Apakah Anda memiliki HP?)"
          placeholderTextColor="#9ca3af"
          value={question}
          onChangeText={setQuestion}
          multiline
        />

        <Text style={styles.label}>Tipe Jawaban</Text>
        <View style={styles.typeContainer}>
          {(['boolean', 'text', 'number'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeButton, type === t && styles.typeButtonActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextActive]}>
                {t === 'boolean' ? 'Ya/Tidak' : t === 'text' ? 'Teks' : 'Angka'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addButtonText}>Tambah Premise</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Daftar Premises ({premises.length})</Text>

        {premises.length === 0 ? (
          <View style={styles.emptyCard}>
            <HelpCircle color="#ccc" size={48} />
            <Text style={styles.emptyText}>Belum ada premise</Text>
          </View>
        ) : (
          premises.map((premise) => (
            <View key={premise.id} style={styles.premiseCard}>
              <View style={styles.premiseHeader}>
                <Text style={styles.premiseName}>{premise.name}</Text>
                <TouchableOpacity onPress={() => handleDelete(premise.id)}>
                  <Trash2 color="#ff4444" size={20} />
                </TouchableOpacity>
              </View>
              <Text style={styles.premiseQuestion}>{premise.question}</Text>
              <View style={styles.premiseTypeTag}>
                <Text style={styles.premiseTypeText}>
                  {premise.type === 'boolean' ? 'Ya/Tidak' : premise.type === 'text' ? 'Teks' : 'Angka'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  listSection: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 12,
  },
  premiseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  premiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiseName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#667eea',
  },
  premiseQuestion: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  premiseTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  premiseTypeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#667eea',
  },
});
