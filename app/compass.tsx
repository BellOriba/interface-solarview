import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Navigation } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Colors, Spacing, Typography } from '@/constants/colors';

export default function CompassScreen() {
  const { optimalAzimuth } = useLocalSearchParams<{ optimalAzimuth: string }>();
  const [currentHeading, setCurrentHeading] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const rotationAnim = new Animated.Value(0);

  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = isDark ? Colors.dark : Colors.light;

  const optimalDirection = optimalAzimuth ? parseFloat(optimalAzimuth) : 180;

  if (Platform.OS === 'web') {
    const webStyles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      backButton: {
        marginRight: Spacing.md,
      },
      title: {
        ...Typography.h2,
        color: colors.text,
        flex: 1,
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
        maxWidth: 800,
        padding: Spacing.xl,
      },
      message: {
        ...Typography.h2,
        color: colors.text,
        textAlign: 'center',
      },
    });

    return (
      <SafeAreaView style={webStyles.container}>
        <View style={webStyles.header}>
          <TouchableOpacity style={webStyles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={webStyles.title}>{t('solarCompass')}</Text>
        </View>
        <View style={webStyles.content}>
          <Card style={webStyles.card}>
            <Text style={webStyles.message}>{t('compassWebUnavailable')}</Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    startCompass();
    return () => {
      stopCompass();
    };
  }, []);

  useEffect(() => {
    Animated.timing(rotationAnim, {
      toValue: -currentHeading,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentHeading]);

  const startCompass = async () => {
    try {
      const Sensors = require('expo-sensors');
      const { status } = await Sensors.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionNeeded'), t('sensorsAccessRequired'));
        return;
      }

      const sub = Sensors.Magnetometer.addListener(({ y, x }: { x: number; y: number }) => {
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setCurrentHeading(angle);
      });

      Sensors.Magnetometer.setUpdateInterval(100);
      setSubscription(sub);
    } catch (error) {
      Alert.alert(t('error'), t('compassAccessError') ?? '');
    }
  };
  
  const stopCompass = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  const getDifferenceAngle = () => {
    let diff = optimalDirection - currentHeading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return Math.abs(diff);
  };

  const isAligned = () => getDifferenceAngle() < 15;

  const getAlignmentColor = () => {
    const diff = getDifferenceAngle();
    if (diff < 15) return colors.success;
    if (diff < 30) return colors.warning;
    return colors.error;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: Spacing.md,
    },
    title: {
      ...Typography.h2,
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    compassContainer: {
      width: 300,
      height: 300,
      borderRadius: 150,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    compass: {
      width: 280,
      height: 280,
      borderRadius: 140,
      justifyContent: 'center',
      alignItems: 'center',
    },
    northIndicator: {
      position: 'absolute',
      top: 10,
      alignItems: 'center',
    },
    northText: {
      ...Typography.body1,
      color: colors.primary,
      fontWeight: '700',
    },
    optimalArrow: {
      position: 'absolute',
      width: 4,
      height: 120,
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    currentArrow: {
      position: 'absolute',
      alignItems: 'center',
    },
    infoSection: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    currentHeading: {
      ...Typography.h1,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    optimalHeading: {
      ...Typography.h2,
      color: colors.primary,
      marginBottom: Spacing.sm,
    },
    alignmentStatus: {
      ...Typography.body1,
      fontWeight: '600',
      marginBottom: Spacing.sm,
    },
    difference: {
      ...Typography.body2,
      color: colors.textSecondary,
    },
  });

  const optimalArrowRotation = optimalDirection;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('solarCompass')}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.compassContainer}>
          <Animated.View
            style={[
              styles.compass,
              { transform: [{ rotate: `${rotationAnim}deg` }] },
            ]}
          >
            <View style={styles.northIndicator}>
              <Text style={styles.northText}>N</Text>
            </View>
            <View
              style={[
                styles.optimalArrow,
                { transform: [{ rotate: `${optimalArrowRotation}deg` }] },
              ]}
            />
            <View
              style={[
                styles.currentArrow,
                { transform: [{ rotate: '0deg' }] },
              ]}
            >
              <Navigation size={60} color={getAlignmentColor()} />
            </View>
          </Animated.View>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.currentHeading}>
            {Math.round(currentHeading)}°
          </Text>
          <Text style={styles.optimalHeading}>
            {t('optimalDirection')}: {Math.round(optimalDirection)}°
          </Text>
          <Text
            style={[
              styles.alignmentStatus,
              { color: getAlignmentColor() },
            ]}
          >
            {isAligned() ? t('aligned') : t('notAligned')}
          </Text>
          <Text style={styles.difference}>
            {t('difference')}: {Math.round(getDifferenceAngle())}°
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}