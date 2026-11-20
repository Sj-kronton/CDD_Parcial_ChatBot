import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import type { ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

const PURPLE = '#5B2C83';
const WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;

const QUICK_PROMPTS = [
  '¿Cuál es mi estado académico y PGA?',
  '¿Qué materias puedo matricular el próximo semestre?',
  '¿Cómo voy en Competencias Digitales (CCD)?',
  'Ver últimas noticias y convocatorias UNAB',
];

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

type WebhookPayload = {
  respuesta?: string;
  output?: string;
  text?: string;
  message?: string;
};

function createSessionId(studentId: string) {
  return `${studentId}_${Date.now()}`;
}

export default function ChatScreen() {
  const { student, setStudent } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: `¡Hola${student?.nombre ? `, ${student.nombre}` : ''}! Soy tu Asistente Académico UNAB. ¿En qué puedo ayudarte?`,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollViewInstance | null>(null);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!student) router.replace('/');
  }, [student]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isSending]);

  const closeSession = () => {
    setStudent(null);
    router.replace('/');
  };

  const sendMessage = async (messageText: string) => {
    const message = messageText.trim();
    if (!message || isSending || !student) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text: message },
    ]);
    setDraft('');
    setIsSending(true);

    try {
      if (!WEBHOOK_URL) {
        throw new Error('Falta configurar EXPO_PUBLIC_N8N_WEBHOOK_URL.');
      }

      const currentSessionId =
        sessionId.current ?? createSessionId(student.id_estudiante);
      sessionId.current = currentSessionId;

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          id_estudiante: student.id_estudiante,
          mensaje: message,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `El servicio de chat respondió con el estado ${response.status}.`,
        );
      }

      const data: WebhookPayload | WebhookPayload[] = await response.json();
      const payload = Array.isArray(data) ? data[0] : data;
      const textoRespuesta =
        payload?.respuesta ||
        payload?.output ||
        payload?.text ||
        payload?.message;

      if (!textoRespuesta?.trim()) {
        throw new Error(
          'El servicio respondió, pero no se encontró un mensaje de texto.',
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: textoRespuesta,
        },
      ]);
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al enviar el mensaje.';
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: `No se pudo completar la consulta. ${errorText}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!student) return null;

  const fullName = [student.nombre, student.apellido].filter(Boolean).join(' ');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.header}>
          <View style={styles.headerIdentity}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                color="#FFFFFF"
                name="account-school-outline"
                size={24}
              />
            </View>
            <View style={styles.headerText}>
              <Text numberOfLines={1} style={styles.studentName}>
                {fullName || 'Estudiante UNAB'}
              </Text>
              <Text numberOfLines={1} style={styles.studentDetails}>
                {student.id_estudiante} · Semestre{' '}
                {student.semestre_actual ?? '—'}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={closeSession}
            style={styles.logoutButton}
          >
            <MaterialCommunityIcons
              color="#5B2C83"
              name="logout"
              size={18}
            />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.chatHeading}>
            <View style={styles.onlineDot} />
            <Text style={styles.chatHeadingText}>Asistente académico</Text>
          </View>

          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.userMessageRow : styles.assistantMessageRow,
                ]}
              >
                {!isUser ? (
                  <View style={styles.messageAvatar}>
                    <MaterialCommunityIcons
                      color={PURPLE}
                      name="school-outline"
                      size={17}
                    />
                  </View>
                ) : null}
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : null,
                    ]}
                  >
                    {message.text}
                  </Text>

                  {message.id === 'welcome' ? (
                    <View style={styles.promptGrid}>
                      {QUICK_PROMPTS.map((prompt) => (
                        <Pressable
                          key={prompt}
                          accessibilityRole="button"
                          disabled={isSending}
                          onPress={() => sendMessage(prompt)}
                          style={({ pressed }) => [
                            styles.promptButton,
                            pressed ? styles.promptPressed : null,
                          ]}
                        >
                          <Text style={styles.promptText}>{prompt}</Text>
                          <MaterialCommunityIcons
                            color={PURPLE}
                            name="arrow-up-right"
                            size={16}
                          />
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}

          {isSending ? (
            <View style={[styles.messageRow, styles.assistantMessageRow]}>
              <View style={styles.messageAvatar}>
                <MaterialCommunityIcons
                  color={PURPLE}
                  name="school-outline"
                  size={17}
                />
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <ActivityIndicator color={PURPLE} size="small" />
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            editable={!isSending}
            multiline
            onChangeText={setDraft}
            onSubmitEditing={() => sendMessage(draft)}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor="#94A3B8"
            returnKeyType="send"
            style={styles.composerInput}
            value={draft}
          />
          <Pressable
            accessibilityLabel="Enviar mensaje"
            accessibilityRole="button"
            disabled={isSending || !draft.trim()}
            onPress={() => sendMessage(draft)}
            style={({ pressed }) => [
              styles.sendButton,
              pressed ? styles.sendPressed : null,
              isSending || !draft.trim() ? styles.sendDisabled : null,
            ]}
          >
            <MaterialCommunityIcons color="#FFFFFF" name="send" size={19} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  keyboardAvoiding: { flex: 1 },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E7EAF0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIdentity: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  avatar: {
    alignItems: 'center',
    backgroundColor: PURPLE,
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: { flex: 1, marginLeft: 11, marginRight: 8 },
  studentName: { color: '#172033', fontSize: 14, fontWeight: '700' },
  studentDetails: { color: '#64748B', fontSize: 11, marginTop: 4 },
  logoutButton: {
    alignItems: 'center',
    borderColor: '#E2D6EC',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 9,
  },
  logoutText: { color: PURPLE, fontSize: 11, fontWeight: '700' },
  messagesContent: {
    alignSelf: 'center',
    maxWidth: 760,
    paddingHorizontal: 18,
    paddingBottom: 24,
    paddingTop: 22,
    width: '100%',
  },
  chatHeading: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#EEE8F4',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 7,
    marginBottom: 22,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  onlineDot: {
    backgroundColor: '#22A06B',
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  chatHeadingText: { color: PURPLE, fontSize: 11, fontWeight: '700' },
  messageRow: { alignItems: 'flex-end', flexDirection: 'row', marginBottom: 16 },
  assistantMessageRow: { justifyContent: 'flex-start' },
  userMessageRow: { justifyContent: 'flex-end' },
  messageAvatar: {
    alignItems: 'center',
    backgroundColor: '#EEE8F4',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginRight: 8,
    width: 28,
  },
  messageBubble: {
    borderRadius: 17,
    maxWidth: '88%',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EAF0',
    borderWidth: 1,
    borderBottomLeftRadius: 5,
  },
  userBubble: { backgroundColor: PURPLE, borderBottomRightRadius: 5 },
  messageText: { color: '#334155', fontSize: 14, lineHeight: 21 },
  userMessageText: { color: '#FFFFFF' },
  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 15,
  },
  promptButton: {
    alignItems: 'center',
    backgroundColor: '#F8F5FB',
    borderColor: '#E6DCEC',
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '48%',
  },
  promptPressed: { backgroundColor: '#EEE8F4' },
  promptText: { color: PURPLE, flex: 1, fontSize: 11, fontWeight: '600' },
  composer: {
    alignItems: 'flex-end',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginBottom: 10,
    marginHorizontal: 16,
    maxWidth: 760,
    padding: 8,
    width: '92%',
  },
  composerInput: {
    color: '#172033',
    flex: 1,
    fontSize: 14,
    maxHeight: 110,
    minHeight: 40,
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: PURPLE,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendPressed: { backgroundColor: '#482269' },
  sendDisabled: { opacity: 0.45 },
});
