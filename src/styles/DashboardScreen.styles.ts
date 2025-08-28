import { StyleSheet, Platform } from 'react-native';

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark theme like 50agents
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  loadingSubText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  organizationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 15,
  },
  dropdownButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 4,
  },
  backArrow: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  myAssistantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  myAssistantAvatar: {
    // backgroundColor: '#4CAF50', // Green for My Assistant
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  agentInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agentName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#232323',
    borderRadius: 8,
    minWidth: 160,
    zIndex: 1000,
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
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dropdownItemIcon: {
    fontSize: 18,
    color: '#fff',
    marginRight: 10,
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#232323',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalErrorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalCancelButton: {
    backgroundColor: '#3a3a3a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  modalCreateButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
