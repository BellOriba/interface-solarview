import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity,
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Navigation, ChevronDown } from 'lucide-react-native';
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
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [peakPower, setPeakPower] = useState('');
  const [systemLoss, setSystemLoss] = useState('14');
  const [isLoading, setIsLoading] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);
  const [panelModels, setPanelModels] = useState<PanelModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<PanelModel | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    loadPanelModels();
  }, []);

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

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(t('error'), 'Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
    } catch (error) {
      Alert.alert(t('error'), 'Error getting location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (model: PanelModel) => {
    setSelectedModel(model);
    setPeakPower(model.capacity.toString());
    setSystemLoss('14'); // Default system loss
    setShowModelPicker(false);
  };

  const validateForm = () => {
    if (!latitude || !longitude || !peakPower || !systemLoss) {
      Alert.alert(t('error'), 'Please fill all fields');
      return false;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert(t('error'), 'Invalid latitude');
      return false;
    }
    
    if (isNaN(lon) || lon < -180 || lon > 180) {
      Alert.alert(t('error'), 'Invalid longitude');
      return false;
    }

    return true;
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
    locationButtons: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    locationButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
      gap: Spacing.sm,
    },
    locationButtonText: {
      color: colors.primary,
      fontWeight: '600',
    },
    inputRow: {
      flexDirection: 'row',
      gap: Spacing.md,
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
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SolarView</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('coordinates')}</Text>
          
          <View style={styles.locationButtons}>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Navigation size={20} color={colors.primary} />
              <Text style={styles.locationButtonText}>GPS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.locationButton}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.locationButtonText}>Mapa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Input
              label={t('latitude')}
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
              style={styles.inputHalf}
            />
            <Input
              label={t('longitude')}
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
              style={styles.inputHalf}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuração do Painel</Text>
          
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setUseManualInput(!useManualInput)}
          >
            <Text style={styles.toggleText}>
              {useManualInput ? t('manualInput') : t('selectPanelModel')}
            </Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {!useManualInput && (
            <Card>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowModelPicker(true)}
              >
                <Text style={styles.toggleText}>
                  {selectedModel ? selectedModel.name : 'Selecionar Modelo'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </Card>
          )}

          <View style={styles.inputRow}>
            <Input
              label={t('peakPower')}
              value={peakPower}
              onChangeText={setPeakPower}
              keyboardType="numeric"
              style={styles.inputHalf}
              disabled={!useManualInput && selectedModel !== null}
            />
            <Input
              label={t('systemLoss')}
              value={systemLoss}
              onChangeText={setSystemLoss}
              keyboardType="numeric"
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
            <Text style={styles.sectionTitle}>Selecionar Modelo</Text>
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