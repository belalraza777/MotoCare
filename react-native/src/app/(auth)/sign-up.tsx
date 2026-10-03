import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  // true once we're on the "enter code" step instead of the form
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUp = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      // sends the 6-digit code — account isn't active until it's verified
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

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.brand}>
          <Image
            source={require('../../../assets/motocarelogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Code sent to {email}</Text>
        </View>

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
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.brand}>
        <Image
          source={require('../../../assets/motocarelogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start tracking your ride today</Text>
      </View>

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
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <Link href="/(auth)/sign-in" style={styles.link}>Already have an account? Sign In</Link>

      {/* required DOM hook for Clerk's bot-protection widget */}
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
    brand: { alignItems: 'center', marginBottom: Spacing.xl },
    logo: { width: 72, height: 72, marginBottom: Spacing.md },
    title: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.xs + 2,
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