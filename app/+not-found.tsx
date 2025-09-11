import { Link, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/colors';
import { Card } from '@/components/ui/Card';

export default function NotFoundScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...Typography.h2,
      color: colors.text,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      width: '100%',
      maxWidth: 720,
      padding: Spacing.xl,
      borderRadius: BorderRadius.lg,
    },
    message: {
      ...Typography.h3,
      color: colors.text,
      textAlign: 'center',
    },
    link: {
      marginTop: Spacing.lg,
      alignSelf: 'center',
    },
    linkText: {
      ...Typography.body1,
      color: colors.primary,
      textAlign: 'center',
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: t('oops') }} />
      <View style={styles.header}>
        <Text style={styles.title}>{t('oops')}</Text>
      </View>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.message}>{t('screenNotFound')}</Text>
          <Link href="/" style={styles.link}>
            <Text style={styles.linkText}>{t('goHome')}</Text>
          </Link>
        </Card>
      </View>
    </SafeAreaView>
  );
}
