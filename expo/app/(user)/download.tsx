import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useSurvey } from '@/contexts/SurveyContext';
import { Survey } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Download, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function DownloadScreen() {
  const { surveys } = useSurvey();
  const { currentUser } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generatePDF = async () => {
    if (userSurveys.length === 0) {
      Alert.alert('Tidak Ada Data', 'Anda belum memiliki riwayat rekomendasi');
      return;
    }

    setIsGenerating(true);

    try {
      let surveysHTML = '';
      
      userSurveys.forEach((survey: Survey, index: number) => {
        surveysHTML += `
          <div style="margin-bottom: 30px; border: 2px solid #667eea; border-radius: 12px; padding: 20px; background-color: #f8f9ff;">
            <h3 style="color: #667eea; margin-top: 0;">Rekomendasi #${index + 1}</h3>
            <p style="color: #666; margin: 5px 0;"><strong>📅 Tanggal:</strong> ${formatDate(survey.timestamp)}</p>
            <p style="color: #1a1a1a; margin: 5px 0; padding: 10px; background-color: #e8ecff; border-radius: 8px;"><strong>🎯 Hasil Rekomendasi:</strong> ${survey.result}</p>
            
            <h4 style="color: #1a1a1a; margin-top: 20px; margin-bottom: 10px;">Pertanyaan dan Jawaban:</h4>
            <div style="background-color: white; padding: 15px; border-radius: 8px;">
        `;
        
        if (survey.questions && survey.questions.length > 0) {
          survey.questions.forEach((q, idx) => {
            const displayAnswer = typeof q.answer === 'boolean' ? (q.answer ? 'Ya' : 'Tidak') : q.answer;
            surveysHTML += `
              <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                <p style="color: #667eea; font-weight: 600; margin: 0 0 5px 0;">Q${idx + 1}. ${q.question}</p>
                <p style="color: #1a1a1a; margin: 0; padding-left: 20px;"><strong>Jawaban:</strong> ${displayAnswer}</p>
              </div>
            `;
          });
        } else {
          Object.entries(survey.responses).forEach(([key, value], idx) => {
            const displayValue = typeof value === 'boolean' ? (value ? 'Ya' : 'Tidak') : value;
            surveysHTML += `
              <div style="margin-bottom: 10px;">
                <p style="color: #1a1a1a; margin: 0;"><strong>${idx + 1}.</strong> ${displayValue}</p>
              </div>
            `;
          });
        }
        
        surveysHTML += `
            </div>
          </div>
        `;
      });

      const html = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Laporan Rekomendasi</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              padding: 40px;
              color: #1a1a1a;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #667eea;
              margin: 0 0 10px 0;
            }
            .info-box {
              background-color: #f8f9ff;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 LAPORAN REKOMENDASI LENGKAP</h1>
            <p style="color: #666; margin: 5px 0;">Aplikasi Rekomendasi iPhone</p>
          </div>
          
          <div class="info-box">
            <p style="margin: 5px 0;"><strong>Total Rekomendasi:</strong> ${userSurveys.length}</p>
            <p style="margin: 5px 0;"><strong>Tanggal Cetak:</strong> ${formatDate(Date.now())}</p>
            <p style="margin: 5px 0;"><strong>User:</strong> ${currentUser?.username}</p>
          </div>

          ${surveysHTML}

          <div class="footer">
            <p>Terima kasih telah menggunakan Aplikasi Rekomendasi iPhone</p>
            <p style="font-size: 12px; color: #999;">Dokumen ini dibuat secara otomatis</p>
          </div>
        </body>
        </html>
      `;

      const result = await Print.printToFileAsync({ html });
      
      if (!result || !result.uri) {
        throw new Error('Gagal membuat file PDF');
      }
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Bagikan Laporan Rekomendasi',
        UTI: 'com.adobe.pdf',
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat membuat laporan. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Download Laporan</Text>
      <Text style={styles.subtitle}>Export laporan rekomendasi Anda</Text>

      <View style={styles.statsCard}>
        <FileText color="#667eea" size={32} />
        <Text style={styles.statsNumber}>{userSurveys.length}</Text>
        <Text style={styles.statsLabel}>Rekomendasi Tersimpan</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Download Laporan</Text>

        <TouchableOpacity 
          style={[styles.downloadButton, isGenerating && styles.downloadButtonDisabled]} 
          onPress={generatePDF}
          disabled={isGenerating}
        >
          <View style={styles.downloadButtonContent}>
            {isGenerating ? (
              <ActivityIndicator color="#667eea" size={24} />
            ) : (
              <Download color="#667eea" size={24} />
            )}
            <View style={styles.downloadButtonText}>
              <Text style={styles.downloadButtonTitle}>
                {isGenerating ? 'Membuat Laporan...' : 'Download Laporan'}
              </Text>
              <Text style={styles.downloadButtonSubtitle}>
                Laporan lengkap semua rekomendasi Anda
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Catatan</Text>
        <Text style={styles.infoText}>
          Laporan berisi semua riwayat rekomendasi Anda termasuk tanggal, hasil rekomendasi, dan jawaban lengkap dari setiap pertanyaan. Anda dapat membagikan atau menyimpan laporan ini.
        </Text>
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
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#667eea',
    marginTop: 12,
  },
  statsLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  downloadButton: {
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
  downloadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  downloadButtonText: {
    flex: 1,
  },
  downloadButtonTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  downloadButtonSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  infoCard: {
    backgroundColor: '#f0f3ff',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#667eea',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
