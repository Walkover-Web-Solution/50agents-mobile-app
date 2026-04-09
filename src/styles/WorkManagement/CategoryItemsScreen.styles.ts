import { StyleSheet } from 'react-native';

const categoryItemsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 46,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  backButton: {
    padding: 8,
    marginLeft: -8,
  },

  headerContent: {
    flex: 1,
    marginHorizontal: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  filtersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },

  filtersText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  workItemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    marginHorizontal: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  workItemHeader: {
    marginBottom: 12,
  },

  workItemTitleSection: {
    flex: 1,
  },

  workItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  workItemDescription: {
    fontSize: 13,
    color: '#666',
  },

  workItemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  detailItem: {
    marginBottom: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },

  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },

  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },

  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    backgroundColor: '#6366f120',
  },

  assigneeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6366f1',
  },

  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    backgroundColor: '#64748b20',
  },

  dateText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
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
    fontSize: 14,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
  },

  emptySubText: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },

  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },

  filterModalContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    maxHeight: '80%',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 60,
  },

  filterModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },

  filterModalSection: {
    marginBottom: 24,
  },

  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },

  filterOptionSelected: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: '#c7d2fe',
  },

  filterOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },

  filterOptionTextSelected: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
});

export default categoryItemsStyles;
