import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useSurvey } from '@/contexts/SurveyContext';
import { Rule } from '@/types';
import { Plus, Trash2, GitBranch, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export default function RulesScreen() {
  const { logic, updateLogic } = useSurvey();
  const [showModal, setShowModal] = useState(false);
  const [selectedPremises, setSelectedPremises] = useState<string[]>([]);
  const [selectedSubgoal, setSelectedSubgoal] = useState('');

  const rules = logic?.rules || [];
  const premises = logic?.premises || [];
  const subgoals = logic?.subgoals || [];

  const handleAddCondition = () => {
    if (premises.length === 0) {
      Alert.alert('Error', 'Buat premise terlebih dahulu');
      return;
    }
    setSelectedPremises([...selectedPremises, premises[0].id]);
  };

  const handleRemoveCondition = (index: number) => {
    setSelectedPremises(selectedPremises.filter((_, i) => i !== index));
  };

  const handleSaveRule = async () => {
    if (selectedPremises.length === 0) {
      Alert.alert('Error', 'Tambahkan minimal 1 kondisi');
      return;
    }

    if (!selectedSubgoal) {
      Alert.alert('Error', 'Pilih subgoal');
      return;
    }

    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      name: `Rule ${rules.length + 1}`,
      conditions: selectedPremises.map(premiseId => ({
        premiseId,
        operator: '==' as const,
        value: true,
      })),
      subgoalId: selectedSubgoal,
    };

    try {
      await updateLogic({
        ...logic!,
        rules: [...rules, newRule],
      });
      setShowModal(false);
      setSelectedPremises([]);
      setSelectedSubgoal('');
      Alert.alert('Berhasil', 'Rule berhasil ditambahkan');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Hapus Rule', 'Yakin ingin menghapus rule ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateLogic({
              ...logic!,
              rules: rules.filter(r => r.id !== id),
            });
            Alert.alert('Berhasil', 'Rule berhasil dihapus');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Terjadi kesalahan');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kelola Rules</Text>
        <Text style={styles.subtitle}>IF premises THEN subgoal</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (premises.length === 0) {
              Alert.alert('Error', 'Buat premise terlebih dahulu');
              return;
            }
            if (subgoals.length === 0) {
              Alert.alert('Error', 'Buat subgoal terlebih dahulu');
              return;
            }
            setShowModal(true);
          }}
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.addButtonText}>Tambah Rule</Text>
        </TouchableOpacity>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Daftar Rules ({rules.length})</Text>

          {rules.length === 0 ? (
            <View style={styles.emptyCard}>
              <GitBranch color="#ccc" size={48} />
              <Text style={styles.emptyText}>Belum ada rule</Text>
            </View>
          ) : (
            rules.map((rule) => {
              const subgoal = subgoals.find(s => s.id === rule.subgoalId);
              return (
                <View key={rule.id} style={styles.ruleCard}>
                  <View style={styles.ruleHeader}>
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <TouchableOpacity onPress={() => handleDelete(rule.id)}>
                      <Trash2 color="#ff4444" size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.ruleContent}>
                    <Text style={styles.ruleLabel}>IF:</Text>
                    {rule.conditions.map((condition, index) => {
                      const premise = premises.find(p => p.id === condition.premiseId);
                      return (
                        <Text key={index} style={styles.ruleCondition}>
                          • {premise?.name || 'Unknown'} == {condition.value ? 'true' : 'false'}
                        </Text>
                      );
                    })}
                    <Text style={styles.ruleLabel}>THEN:</Text>
                    <Text style={styles.ruleSubgoal}>→ {subgoal?.name || 'Unknown'}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Rule Baru</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Kondisi (IF):</Text>
              
              {selectedPremises.map((premiseId, index) => (
                <View key={index} style={styles.conditionRow}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={premiseId}
                      onValueChange={(value) => {
                        const newPremises = [...selectedPremises];
                        newPremises[index] = value;
                        setSelectedPremises(newPremises);
                      }}
                    >
                      {premises.map(p => (
                        <Picker.Item key={p.id} label={p.name} value={p.id} />
                      ))}
                    </Picker>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveCondition(index)}>
                    <X color="#ff4444" size={20} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addConditionButton} onPress={handleAddCondition}>
                <Plus color="#667eea" size={16} />
                <Text style={styles.addConditionText}>Tambah Kondisi</Text>
              </TouchableOpacity>

              <Text style={styles.modalLabel}>Hasil (THEN):</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSubgoal}
                  onValueChange={setSelectedSubgoal}
                  itemStyle={{ color: '#1a1a1a', fontSize: 16 }}
                >
                  <Picker.Item label="Pilih subgoal..." value="" color="#9ca3af" />
                  {subgoals.map(s => (
                    <Picker.Item key={s.id} label={s.name} value={s.id} />
                  ))}
                </Picker>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveRule}>
              <Text style={styles.saveButtonText}>Simpan Rule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  ruleCard: {
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
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ruleName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#667eea',
  },
  ruleContent: {
    gap: 8,
  },
  ruleLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginTop: 8,
  },
  ruleCondition: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  ruleSubgoal: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#667eea',
    marginBottom: 12,
    marginTop: 8,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  addConditionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addConditionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#667eea',
  },
  saveButton: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
