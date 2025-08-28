import { StyleSheet, Platform } from 'react-native';
import { CONFIG } from '../config';

export const organizationStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.APP.ORGANIZATION_COLORS.backgroundColor, 
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold', 
    color: CONFIG.APP.ORGANIZATION_COLORS.titleColor, 
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    color: CONFIG.APP.ORGANIZATION_COLORS.subtitleColor, 
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, 
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  orgItem: {
    backgroundColor: CONFIG.APP.ORGANIZATION_COLORS.cardBackgroundColor, 
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  orgDetails: {
    flex: 1,
  },
  orgName: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIG.APP.ORGANIZATION_COLORS.orgNameColor, 
    marginBottom: 4,
  },
  orgSubtitle: {
    fontSize: 14,
    color: CONFIG.APP.ORGANIZATION_COLORS.orgSubtitleColor, 
  },
  arrowContainer: {
    marginLeft: 16,
  },
  arrow: {
    fontSize: 20,
    color: CONFIG.APP.ORGANIZATION_COLORS.arrowColor, 
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: CONFIG.APP.ORGANIZATION_COLORS.errorTextColor, 
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 16,
    color: CONFIG.APP.ORGANIZATION_COLORS.loadingTextColor, 
    fontSize: 16,
  },
  emptyText: {
    color: CONFIG.APP.ORGANIZATION_COLORS.emptyTextColor, 
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: CONFIG.APP.ORGANIZATION_COLORS.retryButtonColor, 
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: CONFIG.APP.ORGANIZATION_COLORS.retryButtonTextColor, 
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: CONFIG.APP.ORGANIZATION_COLORS.logoutButtonColor, 
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: CONFIG.APP.ORGANIZATION_COLORS.logoutButtonTextColor, 
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 10,
    paddingBottom: 14,
  },
});
