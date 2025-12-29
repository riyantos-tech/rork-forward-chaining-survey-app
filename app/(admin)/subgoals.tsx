import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSurvey } from '@/contexts/SurveyContext';
import { Subgoal } from '@/types';
import { Plus, Trash2, Target } from 'lucide-react-native';

export default function SubgoalsScreen() {
  const { logic, updateLogic } = useSurvey();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const subgoals = logic?.subgoals || [];

  const handleAdd = async () => {
    if (!name || !description) {
      Alert.alert('Error', 'Nama dan deskripsi harus diisi');
      return;
    }

    const newSubgoal: Subgoal = {
      id: `subgoal-${Date.now()}`,
      name,
      description,
    };

    try {
      await updateLogic({
        ...logic!,
        subgoals: [...subgoals, newSubgoal],
      });
      setName('');
      setDescription('');
      Alert.alert('Berhasil', 'Subgoal berhasil ditambahkan');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Hapus Subgoal', 'Yakin ingin menghapus subgoal ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateLogic({
              ...logic!,
              subgoals: subgoals.filter(s => s.id !== id),
              rules: logic!.rules.filter(r => r.subgoalId !== id),
            });
            Alert.alert('Berhasil', 'Subgoal berhasil dihapus');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Terjadi kesalahan');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kelola Subgoals</Text>
      <Text style={styles.subtitle}>Hasil akhir dari forward chaining</Text>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Tambah Subgoal Baru</Text>

        <TextInput
          style={styles.input}
          placeholder="Nama subgoal (contoh: Rekomendasi iPhone 15)"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Deskripsi subgoal"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addButtonText}>Tambah Subgoal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Daftar Subgoals ({subgoals.length})</Text>

        {subgoals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Target color="#ccc" size={48} />
            <Text style={styles.emptyText}>Belum ada subgoal</Text>
          </View>
        ) : (
          subgoals.map((subgoal) => (
            <View key={subgoal.id} style={styles.subgoalCard}>
              <View style={styles.subgoalHeader}>
                <View style={styles.subgoalIcon}>
                  <Target color="#667eea" size={20} />
                </View>
                <Text style={styles.subgoalName}>{subgoal.name}</Text>
                <TouchableOpacity onPress={() => handleDelete(subgoal.id)}>
                  <Trash2 color="#ff4444" size={20} />
                </TouchableOpacity>
              </View>
              <Text style={styles.subgoalDescription}>{subgoal.description}</Text>
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  subgoalCard: {
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
  subgoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  subgoalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subgoalName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  subgoalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
