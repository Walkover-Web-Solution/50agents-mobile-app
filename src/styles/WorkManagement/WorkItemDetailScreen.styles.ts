import { StyleSheet } from 'react-native';

const workItemDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  content: {
    flex: 1,
  },

  focusModeSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  focusModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  focusModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  focusModeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 6,
    letterSpacing: 0.5,
  },

  workItemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 6,
  },

  descriptionBox: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    padding: 12,
    minHeight: 100,
  },

  descriptionText: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18,
  },

  attachmentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },

  attachmentText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },

  metadataSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  metadataItem: {
    flex: 1,
    marginRight: 12,
  },

  metadataLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  assigneeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  assigneeInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  statusDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  statusDropdownText: {
    fontSize: 13,
    fontWeight: '500',
  },

  priorityDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#fff',
  },

  priorityDropdownText: {
    fontSize: 13,
    fontWeight: '500',
  },

  dueDateDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },

  dueDateDropdownText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
    marginTop: 8,
  },

  categoryDropdownText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  addTagButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 6,
  },

  subWorkItemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  addSubItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#6366f1',
    borderRadius: 6,
    marginTop: 8,
  },

  addSubItemButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },

  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  noCommentsText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },

  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  commentInput: {
    flex: 1,
    fontSize: 12,
    color: '#1a1a1a',
    maxHeight: 80,
    paddingVertical: 4,
  },

  sendButton: {
    padding: 6,
  },

  createdDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  createdDateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterOptionSelected: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: '#6366f120',
    flexDirection: 'row',
    alignItems: 'center',
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

  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginTop: 8,
    maxHeight: 200,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  dropdownItemSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#6366f120',
  },

  dropdownItemText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },

  dropdownItemTextSelected: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },

  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  dropdownModalContent: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },

  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
    marginBottom: 12,
  },

  dateConfirmButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },

  dateConfirmButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  datePickerContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
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
    color: '#333',
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
    color: '#666',
    paddingVertical: 6,
  },

  datePickerDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 2,
  },

  datePickerDaySelected: {
    backgroundColor: '#6366f1',
  },

  datePickerDayText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },

  datePickerDayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  datePickerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  datePickerFooterText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },

  editModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  editModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  editModalCancelButton: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },

  editModalSaveButton: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },

  editModalSaveButtonDisabled: {
    color: '#ccc',
  },

  editModalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  editFormGroup: {
    marginBottom: 20,
  },

  editFormLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  editFormInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: '#f9f9f9',
  },

  editFormTextArea: {
    minHeight: 120,
    paddingTop: 10,
  },

  descriptionInput: {
    color: '#1a1a1a',
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 8,
  },

  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },

  savingText: {
    fontSize: 12,
    color: '#6366f1',
    marginLeft: 8,
    fontWeight: '500',
  },

  commentsList: {
    marginBottom: 12,
  },

  showMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    alignItems: 'center',
  },

  showMoreText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },

  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  commentAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  commentContent: {
    flex: 1,
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  commentTime: {
    fontSize: 11,
    color: '#999',
    marginLeft: 8,
  },

  editedLabel: {
    fontSize: 11,
    color: '#999',
    marginLeft: 6,
    fontStyle: 'italic',
  },

  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },

  commentText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },

  editCommentContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  editCommentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1a1a1a',
    backgroundColor: '#f9f9f9',
    minHeight: 60,
    marginBottom: 8,
  },

  editCommentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },

  modalCloseButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  tagsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  tagColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  tagItemName: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },

  emptyTagsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTagsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },

  dropdownLoadingContainer: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dropdownEmptyItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dropdownEmptyText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
});

export default workItemDetailStyles;
