import { useCallback, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSSO, useSignIn } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
const redirectUrl = AuthSession.makeRedirectUri({ path: 'sso-callback' });

// Helper function to extract a user-friendly error message from Clerk errors
function getClerkErrorMessage(err: unknown, fallback: string) {
  const clerkErr = err as { errors?: Array<{ message?: string; code?: string; meta?: { reason?: string } }> };
  const first = clerkErr.errors?.[0];
  const reason = first?.code ?? first?.meta?.reason;

  if (reason === 'state_token_already_used') {
    return 'Sign-in link expired. Please try Google sign-in again.';
  }

  return first?.message ?? fallback;
}


export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { startSSOFlow } = useSSO();
  const { signIn, setActive, isLoaded } = useSignIn();
  const oauthInFlight = useRef(false);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');

  //Handle Google OAuth sign-in
  const onGooglePress = useCallback(async () => {
    if (!isLoaded) {
      setError('Authentication is still loading. Please try again.');
      return;
    }
    if (oauthInFlight.current) return;

    oauthInFlight.current = true;
    setOauthLoading(true);
    setError('');

    try {
      const { createdSessionId, setActive: activateSession, authSessionResult } =
        await startSSOFlow({ strategy: 'oauth_google', redirectUrl });

      if (createdSessionId && activateSession) {
        await activateSession({ session: createdSessionId });
        router.replace('/(tabs)/garage');
        return;
      }

      if (authSessionResult?.type === 'cancel' || authSessionResult?.type === 'dismiss') {
        return;
      }

      setError('Google sign-in did not complete. Please try again.');
    } catch (err) {
      setError(getClerkErrorMessage(err, 'Google sign-in failed. Please try again.'));
      console.error('OAuth error:', err);
    } finally {
      oauthInFlight.current = false;
      setOauthLoading(false);
    }
  }, [isLoaded, startSSOFlow, router]);

  // Handle email/password sign-in
  const onEmailSignIn = async () => {
    if (!isLoaded) {
      setError('Authentication is still loading. Please try again.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({ identifier: trimmedEmail, password });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)/garage');
        return;
      }

      setError(`Sign-in requires another step (${result.status}). Check your Clerk settings.`);
      console.error('Incomplete sign-in:', result.status);
    } catch (err) {
      setError(getClerkErrorMessage(err, 'Sign in failed'));
      console.error('Email sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.brand}>
        <Image
          source={require('../../../assets/motocarelogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>MotoCare</Text>
        <Text style={styles.subtitle}>Track service, fuel & documents in one place</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.googleButton, (oauthLoading || !isLoaded) && styles.disabled]}
        onPress={onGooglePress}
        disabled={oauthLoading || !isLoaded}
        activeOpacity={0.85}
      >
        <Text style={styles.googleG}>G</Text>
        <Text style={styles.googleButtonText}>
          {!isLoaded ? 'Loading...' : oauthLoading ? 'Signing in...' : 'Continue with Google'}
        </Text>
      </TouchableOpacity>

      {!showEmailForm ? (
        <TouchableOpacity onPress={() => setShowEmailForm(true)} style={styles.toggleLink}>
          <Text style={styles.toggleLinkText}>Sign in with email instead</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.emailForm}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, (loading || !isLoaded) && styles.disabled]}
            onPress={onEmailSignIn}
            disabled={loading || !isLoaded}
          >
            <Text style={styles.buttonText}>
              {!isLoaded ? 'Loading...' : loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/sign-up" style={styles.link}>Don't have an account? Sign Up</Link>
        </View>
      )}

      <Text style={styles.footer}>Ride Better · Maintain Longer</Text>

      <View nativeID="clerk-captcha" />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: Spacing.xl,
      backgroundColor: colors.background,
    },

    brand: { alignItems: 'center', marginBottom: Spacing.xl * 1.5 },
    logo: { width: 84, height: 84, marginBottom: Spacing.md },
    title: {
      fontSize: Typography.size.xxl + 4,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      marginTop: Spacing.xs + 2,
      textAlign: 'center',
    },

    googleButton: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      paddingVertical: Spacing.lg - 2,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
    googleG: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: '#fff',
      backgroundColor: 'rgba(255,255,255,0.2)',
      width: 22,
      height: 22,
      borderRadius: 11,
      textAlign: 'center',
      lineHeight: 22,
      overflow: 'hidden',
    },
    googleButtonText: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
      color: '#fff',
    },

    toggleLink: { marginTop: Spacing.xl - 4, alignItems: 'center' },
    toggleLinkText: {
      color: colors.primary,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.medium,
    },

    emailForm: { marginTop: Spacing.sm },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl - 4 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: {
      marginHorizontal: Spacing.md - 2,
      color: colors.textMuted,
      fontSize: Typography.size.xs,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    button: {
      backgroundColor: colors.primary,
      padding: Spacing.md + 2,
      borderRadius: Radius.sm,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: Typography.weight.semibold,
    },
    link: {
      color: colors.primary,
      textAlign: 'center',
      marginTop: Spacing.lg,
    },
    error: {
      color: colors.error,
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    disabled: { opacity: 0.6 },

    footer: {
      position: 'absolute',
      bottom: Spacing.xl,
      alignSelf: 'center',
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
  });
}