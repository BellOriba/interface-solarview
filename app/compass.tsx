import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Navigation } from 'lucide-react-native';
import * as Sensors from 'expo-sensors';
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

  useEffect(() => {
    startCompass();
    return () => {
      stopCompass();
    };
  }, []);

  useEffect(() => {
    // Animate compass rotation
    Animated.timing(rotationAnim, {
      toValue: -currentHeading,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentHeading]);

  const startCompass = async () => {
    try {
      const { status } = await Sensors.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'É necessário permitir acesso aos sensores');
        return;
      }

      const sub = Sensors.Magnetometer.addListener(({ x, y, z }) => {
        // Calculate heading from magnetometer data
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setCurrentHeading(angle);
      });

      Sensors.Magnetometer.setUpdateInterval(100);
      setSubscription(sub);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível acessar a bússola');
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

  const currentArrowRotation = currentHeading;
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
                transform: [{ rotate: rotationAnim }],
              },
            ]}
          >
            <View style={styles.northIndicator}>
              <Text style={styles.northText}>N</Text>
            </View>
            
            {/* Optimal direction arrow */}
            <View
              style={[
                styles.optimalArrow,
                {
                  transform: [{ rotate: `${optimalArrowRotation}deg` }],
                },
              ]}
            />
            
            {/* Current direction indicator */}
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