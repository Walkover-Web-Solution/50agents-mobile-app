import { StyleSheet, Platform } from 'react-native';

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  flex: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    minHeight: 200,
    maxHeight: '50%',
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
    width: '100%',
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
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: '80%',
    justifyContent: 'center',
    minHeight: 38,
    alignSelf: 'flex-end',
    marginLeft: 20,
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
    width: '100%',
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
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: '80%',
    justifyContent: 'center',
    minHeight: 38,
    alignSelf: 'flex-start',
    marginRight: 20,
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
    paddingHorizontal: 0,
    paddingTop: 25,
    paddingBottom: 15,
    backgroundColor: '#212121',
    marginBottom: Platform.OS === 'android' ? 5 : 0, // Lift input bar slightly on Android
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 0,
    minHeight: 48,
    marginHorizontal: 0,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        paddingTop: 14,
      },
      android: {
        paddingTop: 20,
      },
    }),
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#374151',
    backgroundColor: '#1f2937',
    minHeight: 52,
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
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
    marginLeft: 0,
  },
  backArrow: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26, // match backButton height to center arrow perfectly
    // Android-specific tweaks for perfect vertical centering
    includeFontPadding: false as unknown as boolean,
    textAlignVertical: 'center' as any,
    transform: [{ translateY: Platform.OS === 'android' ? -0.5 : 0 }],
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 0,
    minWidth: 0,
  },
  headerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderWidth: 0,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    flex: 1,
    lineHeight: 20,
    includeFontPadding: false as unknown as boolean,
    flexShrink: 1,
    textAlign: 'left',
    textAlignVertical: 'center' as any,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
  headerSpacer: {
    width: 2,
  },
  modelButton: {
    maxWidth: 110,
    minWidth: 72,
    height: 32,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.15)', // blue tint
    marginRight: 4,
  },
  modelButtonText: {
    fontSize: 11,
    color: '#f9fafb',
    fontWeight: '600',
  },
  threadsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  threadsIcon: {
    fontSize: 20,
    color: '#f9fafb',
    fontWeight: '600',
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 999,
  },
  modelDropdown: {
    position: 'absolute',
    right: 12,
    backgroundColor: '#111827', // darker panel
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#2f343a',
    width: 260,
    maxHeight: 360,
    zIndex: 1000,
  },
  modelDropdownTitle: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  modelOptionText: {
    fontSize: 14,
    color: '#f3f4f6',
    flex: 1,
    marginRight: 8,
  },
  modelServiceTag: {
    fontSize: 12,
    color: '#93c5fd',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    textTransform: 'capitalize',
  },
  emptyModels: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  threadsModal: {
    backgroundColor: '#212121',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '95%',
    minHeight: '90%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
      },
    }),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#6b7280',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    marginHorizontal: 60,
    marginVertical: 16,
  },
  newThreadIcon: {
    fontSize: 18,
    color: '#ffffff',
    marginRight: 6,
  },
  newThreadText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  threadsList: {
    flex: 1,
  },
  threadItemContainer: {
    backgroundColor: '#212121',
  },
  threadsContainer: {
    paddingHorizontal: 16,
  },
  emptyThreads: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
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
    backgroundColor: '#374151',
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
    color: '#9ca3af',
    marginTop: 4,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageCount: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 12,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563eb',
    marginLeft: 8,
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

// Markdown theme for react-native-markdown-display
// Ensures readable typography on dark bubbles and supports headings, lists, bold/italic, code, etc.
export const markdownTheme = {
  body: { 
    color: '#e5e7eb', 
    fontSize: 15, 
    lineHeight: 22,
    width: '100%',
    flexShrink: 1,
    flexWrap: 'wrap'
  },
  paragraph: { 
    color: '#e5e7eb',
    width: '100%',
    flexShrink: 1,
    flexWrap: 'wrap'
  },

  heading1: { color: '#22d3ee', fontSize: 22, fontWeight: '800', marginBottom: 8 },   // Cyan
  heading2: { color: '#a78bfa', fontSize: 19, fontWeight: '800', marginBottom: 6 },   // Violet
  heading3: { color: '#f59e0b', fontSize: 17, fontWeight: '700', marginBottom: 4 },   // Amber
  heading4: { color: '#34d399', fontSize: 15, fontWeight: '700', marginBottom: 3 },   // Emerald
  heading5: { color: '#f472b6', fontSize: 14, fontWeight: '700', marginBottom: 2 },   // Pink
  heading6: { color: '#60a5fa', fontSize: 13, fontWeight: '700', marginBottom: 2 },   // Sky

  strong: { fontWeight: '700', color: '#fefefe' },
  em: { fontStyle: 'italic', color: '#f472b6' },
  link: { color: '#38bdf8', textDecorationLine: 'underline' },

  bullet_list: { 
    color: '#c4b5fd',
    width: '100%',
    flexShrink: 1
  },
  ordered_list: { 
    color: '#93c5fd',
    width: '100%',
    flexShrink: 1
  },
  list_item: { 
    color: '#e5e7eb',
    width: '100%',
    flexShrink: 1,
    flexWrap: 'wrap'
  },

  blockquote: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)', // amber tint
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    paddingLeft: 12,
    paddingVertical: 8,
    color: '#f3f4f6',
    width: '100%',
    flexShrink: 1,
  },

  code_inline: {
    backgroundColor: '#0b1220',
    color: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#334155',
    flexWrap: 'wrap',
  },

  fence: {
    backgroundColor: '#0f172a',
    color: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#22d3ee', // cyan accent bar
    width: '100%',
    flexShrink: 1,
  },

  hr: { backgroundColor: '#334155', height: 1 },
} as const;