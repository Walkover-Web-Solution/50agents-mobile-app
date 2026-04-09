import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75; // 75% of screen width

const workflowStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 54,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 8,
  },
  workspaceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workspaceInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 48,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginLeft: 12,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
});

export default workflowStyles;
