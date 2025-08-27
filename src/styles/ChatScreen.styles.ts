import { StyleSheet, Platform } from 'react-native';

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  modelInfo: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  userMessageWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  userHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  userInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  userBubble: {
    borderRadius: 18,
    padding: 16,
    maxWidth: '85%',
    backgroundColor: '#2563eb',
    marginLeft: 16,
  },
  userMessageText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  agentMessageWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  agentInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  agentHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  agentBubble: {
    borderRadius: 18,
    padding: 16,
    maxWidth: '85%',
    backgroundColor: '#374151',
    marginRight: 16,
  },
  agentMessageText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  inputContainer: {
    paddingHorizontal: 8,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    backgroundColor: '#212121',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#374151',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    paddingVertical: 0,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#ffffff',
  },
  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  dateSeparator: {
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        paddingTop: 14,
      },
      android: {
        paddingTop: 20,
      },
    }),
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#374151',
    backgroundColor: '#1f2937',
    minHeight: 64,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  backArrow: {
    fontSize: 20,
    color: '#f9fafb',
    fontWeight: '400',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 16,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    flex: 1,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  headerSpacer: {
    width: 12,
  },
  threadsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  threadsIcon: {
    fontSize: 20,
    color: '#f9fafb',
    fontWeight: '600',
  },
  threadsModal: {
    flex: 1,
    backgroundColor: '#212121',
  },
  threadsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2f343a',
  },
  threadsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  newThreadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2563eb',
    borderRadius: 24,
  },
  newThreadIcon: {
    fontSize: 24,
    color: '#ffffff',
    marginRight: 8,
  },
  newThreadText: {
    fontSize: 16,
    color: '#ffffff',
  },
  threadsList: {
    flex: 1,
  },
  threadsContainer: {
    padding: 20,
  },
  threadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2f343a',
  },
  activeThreadItem: {
    backgroundColor: '#2563eb',
  },
  threadInfo: {
    flex: 1,
  },
  threadTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  threadDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  threadMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  emptyThreads: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  codeBlock: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    // Cross-platform shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  codeLanguage: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    // Platform-specific font
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  codeText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
    // Cross-platform monospace font
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
    }),
  },
});
