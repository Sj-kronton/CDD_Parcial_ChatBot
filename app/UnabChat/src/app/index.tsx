import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const PURPLE = '#5B2C83';

export default function StudentAccessScreen() {
  const [studentInput, setStudentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { setStudent } = useAuth();

  const handleAccess = async () => {
    const input = studentInput.trim();
    if (!input) {
      setFeedback('Escribe tu ID de Estudiante o correo institucional.');
      return;
    }

    if (!/^[\w.@+-]+$/.test(input)) {
      setFeedback('Revisa el ID o correo e intenta nuevamente.');
      return;
    }

    if (!supabase) {
      setFeedback(
        'Falta configurar la clave pública de Supabase en .env. No uses una clave secreta en la aplicación.',
      );
      return;
    }

    setIsLoading(true);
    setFeedback('');

    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select(
          'id_estudiante, nombre, apellido, programa, semestre_actual, estado_matricula',
        )
        .or(`id_estudiante.eq.${input},email.ilike.${input}`)
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`No se pudo validar el estudiante: ${error.message}`);
      }

      if (!data) {
        setFeedback(
          'No se encontró ningún estudiante registrado con ese ID o correo',
        );
        return;
      }

      setStudent(data);
      router.replace('/chat');
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al validar el estudiante.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.brandMark}>
              <MaterialCommunityIcons
                color="#FFFFFF"
                name="school-outline"
                size={32}
              />
            </View>
            <Text style={styles.eyebrow}>UNIVERSIDAD AUTÓNOMA DE BUCARAMANGA</Text>
            <Text style={styles.title}>Asistente Académico UNAB</Text>
            <Text style={styles.subtitle}>Ingeniería de Sistemas</Text>

            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons
                  color={PURPLE}
                  name="account-school-outline"
                  size={25}
                />
              </View>
              <Text style={styles.cardTitle}>Acceso de estudiantes</Text>
              <Text style={styles.description}>
                Ingresa con tu ID de Estudiante o correo institucional para
                continuar.
              </Text>

              <Text style={styles.label}>ID de Estudiante o correo</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                keyboardType="email-address"
                onChangeText={(value) => {
                  setStudentInput(value);
                  if (feedback) setFeedback('');
                }}
                onSubmitEditing={handleAccess}
                placeholder="U00123456 o nombre@unab.edu.co"
                placeholderTextColor="#94A3B8"
                returnKeyType="go"
                style={styles.input}
                value={studentInput}
              />

              {feedback ? (
                <View style={styles.feedbackBox} accessibilityRole="alert">
                  <MaterialCommunityIcons
                    color="#B42318"
                    name="alert-circle-outline"
                    size={19}
                  />
                  <Text style={styles.feedbackText}>{feedback}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={isLoading}
                onPress={handleAccess}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isLoading ? styles.buttonPressed : null,
                  isLoading ? styles.buttonDisabled : null,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      Ingresar al Asistente
                    </Text>
                    <MaterialCommunityIcons
                      color="#FFFFFF"
                      name="arrow-right"
                      size={20}
                    />
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <MaterialCommunityIcons
                color="#64748B"
                name="shield-check-outline"
                size={16}
              />
              <Text style={styles.footerText}>
                Acceso exclusivo para estudiantes registrados
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardAvoiding: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  content: { alignSelf: 'center', width: '100%', maxWidth: 460 },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: PURPLE,
    borderRadius: 22,
    height: 72,
    justifyContent: 'center',
    marginBottom: 22,
    width: 72,
  },
  eyebrow: {
    color: PURPLE,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  title: {
    color: '#172033',
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 7,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EAF0',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 34,
    padding: 24,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: '#F2EAF8',
    borderRadius: 13,
    height: 46,
    justifyContent: 'center',
    marginBottom: 17,
    width: 46,
  },
  cardTitle: { color: '#172033', fontSize: 20, fontWeight: '700' },
  description: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 23,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    borderWidth: 1,
    color: '#172033',
    fontSize: 15,
    height: 52,
    paddingHorizontal: 14,
  },
  feedbackBox: {
    alignItems: 'flex-start',
    backgroundColor: '#FEF3F2',
    borderColor: '#FECDCA',
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
    padding: 12,
  },
  feedbackText: {
    color: '#912018',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: PURPLE,
    borderRadius: 13,
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    marginTop: 19,
    gap: 9,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  buttonPressed: { backgroundColor: '#482269' },
  buttonDisabled: { opacity: 0.72 },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { color: '#64748B', fontSize: 12 },
});
