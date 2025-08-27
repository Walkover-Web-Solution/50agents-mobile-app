import { StyleSheet, Platform } from 'react-native';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1f2937', // Dark theme consistent with app
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff', // White text for dark theme
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af', // Gray text for dark theme
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 50, // Increased for better touch target
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#374151',
    color: '#ffffff',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2563eb', // Blue consistent with app theme
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
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
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  otpWrapper: {
    flex: 1,
    width: '100%',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
});
