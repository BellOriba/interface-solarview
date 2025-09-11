import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Globe, Moon, Sun, LogOut } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const colors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const handleLogout = () => {
    // On web, Alert doesn't support actionable buttons; use window.confirm instead
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm(t('confirmLogout'));
      if (confirmed) {
        (async () => {
          await logout();
          router.replace('/(auth)/login');
        })();
      }
      return;
    }

    Alert.alert(
      t('logout'),
      t('confirmLogout'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('logout'), 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const toggleLanguage = () => {
    setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR');
  };

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
    },
    contentContainer: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xl * 2,
    },
    section: {
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      ...Typography.h3,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
      marginBottom: Spacing.sm,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: Spacing.md,
    },
    settingText: {
      ...Typography.body1,
      color: colors.text,
      flex: 1,
    },
    settingValue: {
      ...Typography.body2,
      color: colors.textSecondary,
    },
    userInfo: {
      alignItems: 'center',
      padding: Spacing.lg,
    },
    userEmail: {
      ...Typography.h3,
      color: colors.text,
      marginTop: Spacing.sm,
    },
    userRole: {
      ...Typography.body2,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile')}</Text>
          <Card>
            <View style={styles.userInfo}>
              <User size={48} color={colors.primary} />
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userRole}>
                {user?.is_admin ? t('administrator') : t('userRole')}
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('preferences')}</Text>
          <Card>
            <TouchableOpacity style={styles.settingItem} onPress={toggleLanguage}>
              <View style={styles.settingInfo}>
                <Globe size={20} color={colors.primary} style={styles.settingIcon} />
                <Text style={styles.settingText}>{t('language')}</Text>
              </View>
              <Text style={styles.settingValue}>
                {language === 'pt-BR' ? t('portuguese') : t('english')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
              <View style={styles.settingInfo}>
                {isDark ? (
                  <Moon size={20} color={colors.primary} style={styles.settingIcon} />
                ) : (
                  <Sun size={20} color={colors.primary} style={styles.settingIcon} />
                )}
                <Text style={styles.settingText}>{t('theme')}</Text>
              </View>
              <Text style={styles.settingValue}>
                {isDark ? t('darkMode') : t('lightMode')}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Card>
            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
              <View style={styles.settingInfo}>
                <LogOut size={20} color={colors.error} style={styles.settingIcon} />
                <Text style={[styles.settingText, { color: colors.error }]}>
                  {t('logout')}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}