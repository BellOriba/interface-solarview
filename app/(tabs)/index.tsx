import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity,
  Modal,
  Platform,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronDown, LocateFixed } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';
import { PanelModel } from '@/types';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/colors';

export default function CalculateScreen() {
  const { width } = useWindowDimensions();
  
  // Form state
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [peakPower, setPeakPower] = useState('');
  const [systemLoss, setSystemLoss] = useState('14');
  
  // Error states
  const [latitudeError, setLatitudeError] = useState<string | undefined>();
  const [longitudeError, setLongitudeError] = useState<string | undefined>();
  const [peakPowerError, setPeakPowerError] = useState<string | undefined>();
  const [systemLossError, setSystemLossError] = useState<string | undefined>();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Location state
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Panel models state
  const [panelModels, setPanelModels] = useState<PanelModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<PanelModel | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);

  // Context hooks
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  
  // Theme colors
  const colors = isDark ? Colors.dark : Colors.light;
  
  // Translation helper
  const translate = (key: string) => t ? t(key) : key;

  useEffect(() => {
    loadPanelModels();
  }, []);

  const getCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    
    try {
      if (Platform.OS === 'web') {
        // Web geolocation API
        if (!navigator.geolocation) {
          setLocationError('Geolocalização não suportada no seu navegador');
          return;
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            (error) => {
              let message = 'Erro ao obter localização';
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  message = 'Permissão de localização negada';
                  break;
                case error.POSITION_UNAVAILABLE:
                  message = 'Informações de localização indisponíveis';
                  break;
                case error.TIMEOUT:
                  message = 'Tempo de espera da localização expirado';
                  break;
              }
              reject(new Error(message));
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          );
        });

        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      } else {
        // Mobile (Expo Location)
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permissão para acessar a localização foi negada');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 0,
          distanceInterval: 0
        });

        setLatitude(location.coords.latitude.toFixed(6));
        setLongitude(location.coords.longitude.toFixed(6));
      }
      
      // Clear any previous errors
      setLatitudeError(undefined);
      setLongitudeError(undefined);
      setLocationError(null);
    } catch (error) {
      console.error('Error getting location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLocationError(`Não foi possível obter a localização: ${errorMessage}`);
      
      // Show alert for better user feedback
      Alert.alert(
        'Erro de Localização', 
        `Não foi possível obter sua localização: ${errorMessage}. Por favor, insira as coordenadas manualmente.`
      );
    } finally {
      setIsLocating(false);
    }
  };

  const loadPanelModels = async () => {
    try {
      if (user?.api_key) {
        const models = await apiService.getPanelModels(user.api_key);
        setPanelModels(models);
      }
    } catch (error) {
      console.error('Error loading panel models:', error);
    }
  };

  const handleModelSelect = (model: PanelModel) => {
    setSelectedModel(model);
    setPeakPower(model.capacity.toString());
    setSystemLoss(model.efficiency.toString());
    setShowModelPicker(false);
  };


  const validateForm = () => {
    // Reset all errors
    setLatitudeError(undefined);
    setLongitudeError(undefined);
    setPeakPowerError(undefined);
    setSystemLossError(undefined);

    // Check for empty fields
    if (!latitude || !longitude || !peakPower || !systemLoss) {
      Alert.alert(translate('error'), translate('fillAllFields'));
      return false;
    }

    // Parse input values
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const peak = parseFloat(peakPower);
    const loss = parseFloat(systemLoss);

    let isValid = true;

    // Validate latitude
    if (isNaN(lat) || lat < -90 || lat > 90) {
      const error = translate('invalidLatitude');
      setLatitudeError(error);
      Alert.alert(translate('error'), error);
      isValid = false;
    }

    // Validate longitude
    if (isNaN(lon) || lon < -180 || lon > 180) {
      const error = translate('invalidLongitude');
      setLongitudeError(error);
      Alert.alert(translate('error'), error);
      isValid = false;
    }

    // Validate peak power
    if (isNaN(peak) || peak <= 0) {
      const error = translate('peakPowerPositive');
      setPeakPowerError(error);
      Alert.alert(translate('error'), error);
      isValid = false;
    }

    // Validate system loss
    if (isNaN(loss) || loss < 0 || loss > 100) {
      const error = translate('systemLossRange');
      setSystemLossError(error);
      Alert.alert(translate('error'), error);
      isValid = false;
    }

    return isValid;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await apiService.calculateSolarProduction(user!.api_key!, {
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
        peakpower: parseFloat(peakPower),
        loss: parseFloat(systemLoss),
      });

      // Navigate to results with the calculation data
      router.push({
        pathname: '/results',
        params: { 
          resultData: JSON.stringify(result),
          coordinates: JSON.stringify({ lat: parseFloat(latitude), lon: parseFloat(longitude) }),
        },
      });
    } catch (error) {
      Alert.alert(t('error'), 'Error calculating solar production');
    } finally {
      setIsLoading(false);
    }
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
      padding: Spacing.lg,
    },
    section: {
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      ...Typography.h3,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    coordinatesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    coordinateInput: {
      flex: 1,
    },
    inputRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      flexWrap: 'wrap',
    },
    inputHalf: {
      flex: 1,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: Spacing.md,
    },
    toggleText: {
      ...Typography.body1,
      color: colors.text,
    },
    modelPickerModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: Spacing.lg,
    },
    modelPickerContent: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      maxHeight: '80%',
    },
    modelItem: {
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modelName: {
      ...Typography.body1,
      color: colors.text,
      fontWeight: '600',
    },
    modelDetails: {
      ...Typography.body2,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
    locationButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locateButton: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
      minWidth: 44,
      minHeight: 44,
      marginLeft: Spacing.sm,
      marginTop: 0,
    },
    mapButton: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      minWidth: 44,
      minHeight: 44,
      marginLeft: Spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SolarView</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('coordinates')}</Text>
          
          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateInput}>
              <Input
                label="Latitude"
                value={latitude}
                onChangeText={(text) => {
                  setLatitude(text);
                  setLatitudeError(undefined);
                }}
                keyboardType="numeric"
                error={latitudeError}
                placeholder="Ex: -23.5505"
              />
            </View>
            <View style={styles.coordinateInput}>
              <Input
                label="Longitude"
                value={longitude}
                onChangeText={(text) => {
                  setLongitude(text);
                  setLongitudeError(undefined);
                }}
                keyboardType="numeric"
                error={longitudeError}
                placeholder="Ex: -46.6333"
              />
            </View>
            <View style={styles.locationButtons}>
              <TouchableOpacity 
                style={[
                  styles.locateButton, 
                  isLocating && { backgroundColor: colors.primary + '40' }
                ]}
                onPress={getCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <LocateFixed size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('panelConfiguration')}</Text>
            
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowModelPicker(true)}
            >
              <Text style={styles.toggleText}>
                {selectedModel ? selectedModel.name : t('selectModel')}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>

          <View style={styles.inputRow}>
            <Input
              label={t('peakPower')}
              value={peakPower}
              onChangeText={setPeakPower}
              keyboardType="numeric"
              error={peakPowerError}
              style={styles.inputHalf}
            />
            <Input
              label={t('systemLoss')}
              value={systemLoss}
              onChangeText={setSystemLoss}
              keyboardType="numeric"
              error={systemLossError}
              style={styles.inputHalf}
            />
          </View>
        </View>

        <Button
          title={t('calculateProduction')}
          onPress={handleCalculate}
          loading={isLoading}
        />
      </ScrollView>

      <Modal
        visible={showModelPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModelPicker(false)}
      >
        <View style={styles.modelPickerModal}>
          <View style={styles.modelPickerContent}>
            <Text style={styles.sectionTitle}>{t('selectModel')}</Text>
            <ScrollView>
              {panelModels.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={styles.modelItem}
                  onPress={() => handleModelSelect(model)}
                >
                  <Text style={styles.modelName}>{model.name}</Text>
                  <Text style={styles.modelDetails}>
                    {model.manufacturer} • {model.capacity} kWp • {model.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              title={t('cancel')}
              onPress={() => setShowModelPicker(false)}
              variant="outline"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}