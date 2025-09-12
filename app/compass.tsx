import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
  Linking,
  PermissionsAndroid,
  ActivityIndicator,
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Navigation, Settings } from 'lucide-react-native';
import { Magnetometer, MagnetometerMeasurement } from 'expo-sensors';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Location from 'expo-location';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/colors';

export default function CompassScreen() {
  const { optimalAzimuth } = useLocalSearchParams<{ optimalAzimuth: string }>();
  const [currentHeading, setCurrentHeading] = useState<number>(0);
  const [hasCompassPermission, setHasCompassPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const subscription = useRef<ReturnType<typeof Magnetometer.addListener> | null>(null);

  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = isDark ? Colors.dark : Colors.light;

  const optimalDirection = optimalAzimuth ? parseFloat(optimalAzimuth) : 180;

  const startCompass = useCallback(() => {
    try {
      // Check if magnetometer is available
      if (!Magnetometer.isAvailableAsync()) {
        Alert.alert(
          t?.('error') || 'Erro',
          t?.('compassNotAvailable') || 'A bússola não está disponível neste dispositivo.'
        );
        return;
      }

      // Set the update interval
      Magnetometer.setUpdateInterval(100);

      // Start listening to the magnetometer
      subscription.current = Magnetometer.addListener((data: MagnetometerMeasurement) => {
        const { x, y } = data;
        if (x !== null && y !== null) {
          // Calculate the angle in radians and convert to degrees
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          // Convert to 0-360 range
          angle = (angle + 360) % 360;
          setCurrentHeading(angle);
          
          // Vibrate when aligned
          if (isAligned(angle)) {
            Vibration.vibrate(50);
          }
        }
      });
    } catch (error) {
      console.error('Error starting compass:', error);
      Alert.alert(
        t?.('error') || 'Erro',
        t?.('compassAccessError') || 'Não foi possível acessar a bússola. Verifique as configurações do dispositivo.'
      );
    }
  }, [t]);

  const stopCompass = useCallback(() => {
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }
  }, []);

  useEffect(() => {
    const requestCompassPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          // On Android, we need to request both location and sensor permissions
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setHasCompassPermission(false);
            return;
          }
          
          // Additional sensor permission check for Android
          const sensorPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Permissão de Sensor',
              message: 'O aplicativo precisa acessar os sensores do dispositivo para a bússola funcionar.',
              buttonNeutral: 'Perguntar depois',
              buttonNegative: 'Cancelar',
              buttonPositive: 'OK',
            },
          );
          
          if (sensorPermission !== PermissionsAndroid.RESULTS.GRANTED) {
            setHasCompassPermission(false);
            return;
          }
        } else if (Platform.OS === 'ios') {
          // On iOS, we only need to request location permission
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setHasCompassPermission(false);
            return;
          }
        }
        
        // If we got here, we have permission
        setHasCompassPermission(true);
        startCompass();
      } catch (error) {
        console.error('Error requesting compass permission:', error);
        setHasCompassPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    requestCompassPermission();

    return () => {
      stopCompass();
    };
  }, [startCompass, stopCompass]);

  useEffect(() => {
    Animated.spring(rotationAnim, {
      toValue: -currentHeading,
      useNativeDriver: true,
      friction: 5,
      tension: 10,
    }).start();
  }, [currentHeading, rotationAnim]);

  const openSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openSettings();
    } else {
      try {
        // Open location settings on Android
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
        );
      } catch (error) {
        console.error('Error opening settings:', error);
        Alert.alert(
          t?.('error') || 'Erro',
          t?.('openSettingsError') || 'Não foi possível abrir as configurações. Por favor, ative manualmente as permissões de localização e sensores.'
        );
      }
    }
  };

  const getDifferenceAngle = (heading: number = currentHeading): number => {
    let diff = optimalDirection - heading;
    // Normalize to -180 to 180 range
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return Math.abs(diff);
  };

  const isAligned = (heading: number = currentHeading): boolean => 
    getDifferenceAngle(heading) < 15;

  const getAlignmentColor = (): string => {
    const diff = getDifferenceAngle();
    if (diff < 10) return colors.success;
    if (diff < 30) return colors.warning;
    return colors.error;
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {t?.('loadingCompass') ?? 'Carregando bússola...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied state
  if (hasCompassPermission === false) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.permissionContainer}>
          <Settings size={64} color={colors.primary} style={styles.permissionIcon} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            {t?.('permissionRequired') ?? 'Permissão necessária'}
          </Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            {t?.('compassPermissionMessage') ?? 'Para usar a bússola, precisamos de permissão para acessar os sensores de localização do seu dispositivo.'}
          </Text>
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: colors.primary }]}
            onPress={openSettings}
          >
            <Text style={[styles.settingsButtonText, { color: colors.primary }]}>
              {t?.('openSettings') ?? 'Abrir Configurações'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.backButton, { borderColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              {t?.('goBack') ?? 'Voltar'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main compass view
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {t?.('solarCompass') ?? 'Bússola Solar'}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={[styles.compassContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Animated.View
            style={[
              styles.compass,
              { 
                transform: [
                  { rotate: rotationAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg']
                  }) }
                ] 
              },
            ]}
          >
            {/* North indicator */}
            <View style={styles.northIndicator}>
              <Text style={[styles.northText, { color: colors.primary }]}>N</Text>
            </View>
            
            {/* Optimal direction indicator */}
            <View
              style={[
                styles.optimalArrow,
                { 
                  backgroundColor: colors.primary,
                  transform: [{ rotate: `${optimalDirection}deg` }] 
                },
              ]}
            />
            
            {/* Current direction indicator */}
            <View style={styles.currentArrow}>
              <Navigation size={60} color={getAlignmentColor()} />
            </View>
          </Animated.View>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={[styles.currentHeading, { color: colors.text }]}>
            {Math.round(currentHeading)}°
          </Text>
          
          <Text style={[styles.optimalHeading, { color: colors.primary }]}>
            {t?.('solarCompass')}: {Math.round(optimalDirection)}°
          </Text>
          
          <Text style={[styles.alignmentStatus, { color: getAlignmentColor() }]}>
            {isAligned() ? t?.('aligned') : (t?.('keepTurning') || 'Keep turning')}
          </Text>
          
          <Text style={[styles.difference, { color: colors.textSecondary }]}>
            {t?.('difference')}: {Math.round(getDifferenceAngle())}°
          </Text>
        </View>
        
        <View style={styles.tipContainer}>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            {t?.('compassTip') ?? 'Gire o dispositivo até que a seta fique alinhada com a direção ideal.'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    minHeight: 56, // Altura mínima consistente
  },
  headerBackButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensa o espaço do botão de voltar para centralizar
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  compassContainer: {
    width: 260, // Reduzido ligeiramente para caber melhor
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md, // Reduzido o espaçamento
  },
  compass: {
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  northIndicator: {
    position: 'absolute',
    top: 15,
    alignItems: 'center',
    zIndex: 1,
  },
  northText: {
    ...Typography.body1,
    fontWeight: '700',
  },
  directionMarkers: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  directionText: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '600',
  },
  optimalArrow: {
    position: 'absolute',
    width: 3,
    height: 100, // Seta mais curta
    borderRadius: 1.5,
    top: '50%',
    marginTop: -50,
    left: '50%',
    marginLeft: -1.5,
  },
  deviceArrow: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -2,
    zIndex: 2,
  },
  deviceArrowShape: {
    width: 4,
    height: 80,
    borderRadius: 2,
  },
  currentArrow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: Spacing.sm, // Reduzido
    paddingHorizontal: Spacing.md,
  },
  currentHeading: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
    fontSize: 32, // Reduzido ligeiramente
  },
  optimalHeading: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
    fontSize: 18, // Reduzido
    textAlign: 'center',
  },
  alignmentStatus: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
    fontSize: 16, // Reduzido
  },
  difference: {
    ...Typography.body1,
    fontSize: 14,
  },
  tipContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  tipText: {
    ...Typography.body2,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12, // Reduzido
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    marginTop: Spacing.md,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionIcon: {
    marginBottom: Spacing.lg,
  },
  permissionTitle: {
    ...Typography.h2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    ...Typography.body1,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  settingsButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  settingsButtonText: {
    ...Typography.body1,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    ...Typography.body1,
  },
});