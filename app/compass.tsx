import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform // 1. Import Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Navigation } from 'lucide-react-native';
// 2. Conditionally import expo-sensors only if not on web
const Sensors = Platform.OS !== 'web' ? require('expo-sensors') : undefined;
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

  // 3. Handle the web case
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 60, left: 20 }}>
           <TouchableOpacity onPress={() => router.back()}>
             <ArrowLeft size={24} color={colors.text} />
           </TouchableOpacity>
        </View>
        <Text style={{ ...Typography.h2, color: colors.text }}>
          Compass is not available on the web. 🧭
        </Text>
      </SafeAreaView>
    );
  }

  // The rest of your existing component code for iOS and Android goes here...
  const optimalDirection = optimalAzimuth ? parseFloat(optimalAzimuth) : 180;

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
      // The 'Sensors' constant will be defined here because we are not on web
      const { status } = await Sensors.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Access to sensors is required');
        return;
      }

      const sub = Sensors.Magnetometer.addListener(({ y, x }) => {
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setCurrentHeading(angle);
      });

      Sensors.Magnetometer.setUpdateInterval(100);
      setSubscription(sub);
    } catch (error) {
      Alert.alert('Error', 'Could not access the compass');
    }
  };
  
  // ... (the rest of your functions: stopCompass, getDifferenceAngle, etc.)
  // ... (your styles object)
  // ... (your return statement with the JSX for the compass)

  // NOTE: Make sure to include all the remaining functions and the return statement
  // from your original code file below this point. I've omitted them here for brevity.
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
        <Text style={styles.title}>Bússola Solar</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.compassContainer}>
          <Animated.View
            style={[
              styles.compass,
              {
                transform: [{ rotate: `${-currentHeading}deg` }],
              },
            ]}
          >
            <View style={styles.northIndicator}>
              <Text style={styles.northText}>N</Text>
            </View>
            <View
              style={[
                styles.optimalArrow,
                {
                  transform: [{ rotate: `${optimalArrowRotation}deg` }],
                },
              ]}
            />
            <View style={styles.currentArrow}>
              <Navigation size={32} color={getAlignmentColor()} />
            </View>
          </Animated.View>
        </Card>

        <View style={styles.infoSection}>
          <Text style={styles.currentHeading}>
            {currentHeading.toFixed(0)}°
          </Text>
          <Text style={styles.optimalHeading}>
            Ótimo: {optimalDirection.toFixed(0)}°
          </Text>
          <Text style={[styles.alignmentStatus, { color: getAlignmentColor() }]}>
            {isAligned() ? '✓ Alinhado!' : '↻ Continue girando'}
          </Text>
          <Text style={styles.difference}>
            Diferença: {getDifferenceAngle().toFixed(0)}°
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}