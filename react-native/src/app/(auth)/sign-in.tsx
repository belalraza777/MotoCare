import { useCallback, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSSO, useSignIn } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import { Link, useRouter } from 'expo-router';

const redirectUrl = AuthSession.makeRedirectUri({ path: 'sso-callback' });

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

  //Handle email/password sign-in
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
    <View style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.title}>MotoCare</Text>
        <Text style={styles.subtitle}>Track service, fuel & documents in one place</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Primary action */}
      <TouchableOpacity
        style={[styles.googleButton, (oauthLoading || !isLoaded) && styles.disabled]}
        onPress={onGooglePress}
        disabled={oauthLoading || !isLoaded}
      >
        <Text style={styles.googleButtonText}>
          {!isLoaded ? 'Loading...' : oauthLoading ? 'Signing in...' : '🔵  Continue with Google'}
        </Text>
      </TouchableOpacity>

      {/* Secondary path, collapsed by default */}
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
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
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

      <View nativeID="clerk-captcha" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 30, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 6, textAlign: 'center' },

  googleButton: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  toggleLink: { marginTop: 20, alignItems: 'center' },
  toggleLinkText: { color: '#2563eb', fontSize: 14, fontWeight: '500' },

  emailForm: { marginTop: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ddd' },
  dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12 },

  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 16 },
  error: { color: '#ef4444', marginBottom: 16, textAlign: 'center' },
  disabled: { opacity: 0.6 },
});