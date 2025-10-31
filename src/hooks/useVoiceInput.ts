/// src/hooks/useVoiceInput.ts - Enhanced with comprehensive debugging
/// src/hooks/useVoiceInput.ts - Enhanced with comprehensive debugging
import React, { useEffect, useState } from 'react';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';
import { Platform, PermissionsAndroid } from 'react-native';

interface UseVoiceInputProps {
  onFinalText: (text: string) => void;
  locale?: string;
}

export const useVoiceInput = ({ onFinalText, locale = 'en-US' }: UseVoiceInputProps) => {
  const [listening, setListening] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState<string[]>([]);

  // Event handlers following official documentation
  const onSpeechStartHandler = (e: SpeechStartEvent) => {
    console.log('🎤 ✅ 🎉 SPEECH STARTED!', e);
    setListening(true);
    setError('');
  };

  const onSpeechRecognizedHandler = (e: any) => {
    console.log('🎤 🔊 Speech recognized:', e);
  };

  const onSpeechEndHandler = (e: SpeechEndEvent) => {
    console.log('🎤 🏁 Speech ended:', e);
    setListening(false);
  };

  const onSpeechErrorHandler = (e: SpeechErrorEvent) => {
    // Ensure errorMsg is always a string
    const errorMsg = typeof e.error === 'string' 
      ? e.error 
      : e.error?.message || e.error?.code || 'Unknown error';
    console.log('🎤 ❌ Speech error:', errorMsg);
    console.log('🎤 ❌ Error details:', JSON.stringify(e, null, 2));
    
    // Don't set error for common iOS issues that are normal
    if (Platform.OS === 'ios') {
      if (e.error?.code === 'no_match' || errorMsg.includes('no match')) {
        console.log('🎤 🍎 iOS: No speech detected - this is normal, keep trying');
        setListening(false);
        return; // Don't set error state
      }
      if (errorMsg.includes('already started') || errorMsg.includes('Speech recognition already started')) {
        console.log('🎤 🍎 iOS: Voice already started - ignoring this error');
        return; // Don't set error state or change listening state
      }
      if (errorMsg.includes('audio session')) {
        console.log('🎤 🍎 iOS: Audio session issue - will retry');
        setListening(false);
        return; // Don't set error state
      }
    }
    
    // Only set error for real issues
    setError(errorMsg);
    setListening(false);
  };

  const onSpeechResultsHandler = (e: SpeechResultsEvent) => {
    console.log('🎤 ✅ 🎉 FINAL SPEECH RESULTS:', e.value);
    console.log('🎤 📝 Full results object:', JSON.stringify(e, null, 2));
    if (e.value && e.value.length > 0) {
      const finalText = e.value[0];
      setResults(e.value);
      setPartialText(finalText);
      console.log('🎤 🚀 Calling onFinalText with:', finalText);
      console.log('🎤 📝 Final text length:', finalText.length, 'characters');
      onFinalText(finalText);
    } else {
      console.log('🎤 ⚠️ No results in final speech results');
    }
  };

  const onSpeechPartialResultsHandler = (e: SpeechResultsEvent) => {
    console.log('🎤 🔊 🟢 PARTIAL RESULTS:', e.value);
    if (e.value && e.value.length > 0) {
      const partialResult = e.value[0];
      console.log('🎤 📝 Setting partial text:', partialResult);
      setPartialText(partialResult);
    }
  };

  const onSpeechVolumeChangedHandler = (e: any) => {
    if (e.value !== undefined && e.value !== null) {
      console.log('🎤 🔊 Volume level:', e.value);
      if (e.value > 0) {
        console.log('🎤 🎙️ AUDIO DETECTED! Level:', e.value);
      }
      if (e.value > 0.1) {
        console.log('🎤 🗣️ STRONG AUDIO SIGNAL - Speech should be detected!');
      }
    } else {
      console.log('🎤 🔇 No volume data received');
    }
  };

  useEffect(() => {
    // Initialize Voice and register event handlers
    const initializeVoice = async () => {
      try {
        // Clear any existing listeners first
        Voice.removeAllListeners();
        
        // Register event handlers following official documentation
        Voice.onSpeechStart = onSpeechStartHandler;
        Voice.onSpeechRecognized = onSpeechRecognizedHandler;
        Voice.onSpeechEnd = onSpeechEndHandler;
        Voice.onSpeechError = onSpeechErrorHandler;
        Voice.onSpeechResults = onSpeechResultsHandler;
        Voice.onSpeechPartialResults = onSpeechPartialResultsHandler;
        Voice.onSpeechVolumeChanged = onSpeechVolumeChangedHandler;
        
        console.log('🎤 ✅ Voice event handlers registered successfully');
      } catch (error) {
        console.log('🎤 ❌ Error initializing Voice:', error);
      }
    };

    initializeVoice();

    return () => {
      // Cleanup following official documentation
      console.log('🎤 🧹 Cleaning up Voice listeners');
      Voice.removeAllListeners();
      Voice.destroy().catch(console.log);
    };
  }, []);

  // Debug function to check Voice library status
  const debugVoiceStatus = async () => {
    try {
      console.log('🎤 🔍 === VOICE DEBUG STATUS ===');
      
      // Check if Voice is available
      const isAvailable = await Voice.isAvailable();
      console.log('🎤 📱 Voice available:', isAvailable);
      
      // Check current recognition state
      const isRecognizing = await Voice.isRecognizing();
      console.log('🎤 🎙️ Currently recognizing:', isRecognizing);
      
      // Platform-specific checks
      console.log('🎤 📱 Platform:', Platform.OS);
      
      if (Platform.OS === 'android') {
        // Check Android permissions
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        console.log('🎤 🎙️ Android audio permission:', hasPermission);
      }
      
      console.log('🎤 ✅ Voice debug check completed');
    } catch (error) {
      console.log('🎤 ❌ Voice debug error:', error);
    }
  };

  // Android permission request following official docs
  const requestAndroidPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to your microphone to recognize speech.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.log('🎤 ❌ Permission error:', err);
      return false;
    }
  };

  // Start voice recognition with extended options for better sentence capture
  const startListening = async () => {
    try {
      console.log('🎤 🔴 Voice button pressed - starting recognition...');
      
      // Stop any existing recognition first
      try {
        const isRecognizing = await Voice.isRecognizing();
        if (isRecognizing) {
          console.log('🎤 ⚠️ Voice already recognizing, stopping first...');
          await Voice.stop();
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit
        }
      } catch (e) {
        console.log('🎤 🔍 Voice recognition check:', e);
      }

      // Run comprehensive debug check
      await debugVoiceStatus();

      // Check permissions first
      const hasPermission = await requestAndroidPermission();
      if (!hasPermission) {
        setError('Microphone permission denied');
        return;
      }

      // Check if voice is available
      const available = await Voice.isAvailable();
      if (!available) {
        console.log('🎤 ❌ Voice recognition not available');
        return;
      }

      // Clear previous state
      setPartialText('');
      setError('');
      setResults([]);

      // Start voice recognition with extended options for better sentence capture
      console.log('🎤 🚀 Starting voice recognition with locale:', locale);
      console.log('🎤 🔍 Platform:', Platform.OS);
      console.log('🎤 🌍 Using extended listening options for complete sentences...');
      
      // Try different approaches based on platform with extended options
      if (Platform.OS === 'ios') {
        console.log('🎤 🍎 iOS: Using en-US locale with extended listening');
        // iOS with extended listening options
        await Voice.start('en-US', {
          'EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS': 2000,
          'EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS': 2000,
          'EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS': 3000,
        });
      } else {
        console.log('🎤 🤖 Android: Using provided locale with extended options');
        // Android with extended listening options
        await Voice.start(locale, {
          'EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS': 2000,
          'EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS': 2000,
          'EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS': 3000,
          'EXTRA_MAX_RESULTS': 5,
          'EXTRA_PARTIAL_RESULTS': true,
        });
      }
      
      console.log('🎤 ✅ Voice recognition started successfully!');
      console.log('🎤 🔊 Now speak clearly - watching for volume changes...');
      console.log('🎤 ⏰ Extended listening active - speak complete sentences!');
      
      // Set listening state manually if not set by event handler
      setTimeout(() => {
        if (!listening) {
          console.log('🎤 🔄 Manually setting listening state to true');
          setListening(true);
        }
      }, 100);
      
      // Add timeout to check if speech detection is working
      setTimeout(() => {
        console.log('🎤 ⏰ 8 seconds elapsed - if you spoke, check volume logs above');
        console.log('🎤 🔍 If no volume detected, there might be a microphone permission issue');
      }, 8000);
    } catch (error) {
      console.log('🎤 ❌ Start error:', error);
      setError('Failed to start voice recognition');
      setListening(false);
    }
  };

  // Stop voice recognition
  const stopListening = async () => {
    try {
      console.log('🎤 🛑 Stopping voice recognition...');
      await Voice.stop();
      setListening(false);
    } catch (error) {
      console.log('🎤 ❌ Stop error:', error);
      setListening(false);
    }
  };

  // Cancel voice recognition
  const cancelListening = async () => {
    try {
      console.log('🎤 ❌ Cancelling voice recognition...');
      await Voice.cancel();
      setListening(false);
      setPartialText('');
      setError('');
    } catch (error) {
      console.log('🎤 ❌ Cancel error:', error);
      setListening(false);
    }
  };

  // Clear partial text manually
  const clearPartialText = () => {
    console.log('🎤 🧹 Manually clearing partialText');
    setPartialText('');
  };

  // Test voice setup
  const testVoiceSetup = async () => {
    try {
      console.log('🎤 🧪 Testing voice setup...');
      const available = await Voice.isAvailable();
      console.log('🎤 📱 Voice available:', available);
      
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        console.log('🎤 🎙️ Android permission:', hasPermission);
      }
      
      console.log('🎤 ✅ Voice setup test completed');
    } catch (error) {
      console.log('🎤 ❌ Voice setup test error:', error);
    }
  };

  return {
    listening,
    partialText,
    error,
    results,
    startListening,
    stopListening,
    cancelListening,
    clearPartialText, // Clear partial text manually
    testVoiceSetup,
    debugVoiceStatus, // For manual debugging
  };
};