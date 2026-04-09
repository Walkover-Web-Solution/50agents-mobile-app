import { StyleSheet } from 'react-native';

const workItemsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  headerTitleSection: {
    marginBottom: 16,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  menuButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  newItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },

  newItemButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },

  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },

  filterButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },

  content: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  workItemRow: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'column',
  },

  workItemTitleSection: {
    marginBottom: 8,
  },

  workItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },

  workItemDescription: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },

  workItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    backgroundColor: '#e8f5e9',
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2e7d32',
    textTransform: 'uppercase',
  },

  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
  },

  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },

  assigneeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  assigneeInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  dateText: {
    fontSize: 11,
    color: '#999',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
  },

  emptySubText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },

  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },

  filterModalContent: {
    backgroundColor: '#fff',
    marginTop: 80,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    maxHeight: '70%',
  },

  filterModalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterModalSection: {
    marginBottom: 20,
  },

  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },

  filterOptionSelected: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: '#6366f120',
  },

  filterOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  filterOptionTextSelected: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },

  filterButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },

  filterResetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },

  filterResetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  filterApplyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },

  filterApplyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingBottom: 0,
    paddingTop: 10,
  },

  createModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
    paddingBottom: 20,
    width: '100%',
    marginTop: 0,
  },

  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  createModalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
  },

  createModalBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },

  formGroup: {
    marginBottom: 20,
  },

  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  formLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  formPlaceholder: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },

  formValue: {
    fontSize: 14,
    color: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },

  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },

  createModalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#c7d2fe',
    alignItems: 'center',
  },

  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },

  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },

  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  dropdownButtonText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },

  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    zIndex: 1000,
    maxHeight: 200,
  },

  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  dropdownItemText: {
    fontSize: 14,
    color: '#1a1a1a',
  },

  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },

  datePickerContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 350,
  },

  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  datePickerMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  datePickerNav: {
    flexDirection: 'row',
    gap: 8,
  },

  datePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  datePickerDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    paddingVertical: 8,
  },

  datePickerDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },

  datePickerDaySelected: {
    backgroundColor: '#6366f1',
  },

  datePickerDayText: {
    fontSize: 12,
    color: '#1a1a1a',
  },

  datePickerDayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default workItemsStyles;
