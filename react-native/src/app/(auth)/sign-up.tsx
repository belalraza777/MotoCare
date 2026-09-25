import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  // Tracks whether we're on the "enter your code" step vs the initial form
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUp = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      // Sends the 6-digit code to the user's email — required before the account is fully active
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      // Clerk only returns 'complete' once ALL required fields/verifications
      // are satisfied (see Clerk dashboard settings) — anything else means
      // something is still missing, so surface the raw status for debugging
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)/garage');
        return;
      }

      setError(`Verification incomplete (${result.status})`);
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // Second screen: shown only after sign-up succeeds and a code has been sent
  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Code sent to {email}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Verification Code"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity
          style={[styles.button, (loading || !isLoaded) && styles.disabled]}
          onPress={onVerify}
          disabled={loading || !isLoaded}
        >
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // First screen: email + password entry
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
        onPress={onSignUp}
        disabled={loading || !isLoaded}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <Link href="/(auth)/sign-in" style={styles.link}>Already have an account? Sign In</Link>

      {/* Required DOM hook for Clerk's bot-protection widget on password sign-up */}
      <View nativeID="clerk-captcha" />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: Spacing.lg,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    subtitle: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
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
      fontSize: Typography.size.md,
    },
    link: {
      color: colors.primary,
      textAlign: 'center',
      marginTop: Spacing.lg,
    },
    error: {
      color: colors.error,
      marginBottom: Spacing.md,
      textAlign: 'center',
    },
    disabled: { opacity: 0.6 },
  });
}