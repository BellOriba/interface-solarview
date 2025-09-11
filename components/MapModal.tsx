import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, StyleSheet, Dimensions, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { X, MapPin } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { MAP_CONFIG, getMapConfig, getMapStyle } from '@/config/mapConfig';

// Dynamic import baseado na plataforma
let MapView, Marker;

if (Platform.OS === 'web') {
  const WebMaps = require('react-native-web-maps');
  MapView = WebMaps.default;
  Marker = WebMaps.Marker;
} else {
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Define the theme colors type
type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
};

interface MapModalProps {
  visible: boolean;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  onClose: () => void;
  onLocationSelect: (coords: { latitude: number; longitude: number }) => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  visible,
  initialLocation,
  onClose,
  onLocationSelect,
}) => {
  const [region, setRegion] = useState<Region>({
    ...MAP_CONFIG.defaultRegion,
    ...(initialLocation || {}),
  });
  
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const { isDark } = useTheme();
  
  // Obter cores do tema
  const colors: ThemeColors = useMemo(() => ({
    primary: '#FF6B35',
    secondary: isDark ? '#1A1A1A' : '#FFFFFF',
    background: isDark ? '#121212' : '#F8F9FA',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#2C3E50',
    textSecondary: isDark ? '#B0BEC5' : '#6C757D',
    border: isDark ? '#333333' : '#E9ECEF',
    error: isDark ? '#FF5252' : '#DC3545',
    success: isDark ? '#4CAF50' : '#28A745',
    warning: '#FFC107',
  }), [isDark]);
  
  // Obter configurações do mapa
  const mapConfig = useMemo(() => getMapConfig(), []);
  const mapStyle = useMemo(() => getMapStyle(isDark), [isDark]);

  useEffect(() => {
    if (initialLocation) {
      setRegion({
        ...initialLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleMapPress = (e: any) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
    onClose();
  };

  // Configurações específicas para cada plataforma
  const mapProps = useMemo(() => {
    if (Platform.OS === 'web') {
      return {
        googleMapsApiKey: mapConfig.web.apiKey,
        defaultZoom: mapConfig.web.defaultZoom,
        defaultCenter: region,
        onClick: handleMapPress,
        onLoad: () => setIsMapReady(true),
        style: [mapStyle.map, styles.map],
      };
    } else {
      return {
        style: [mapStyle.map, styles.map],
        region: region,
        onRegionChangeComplete: setRegion,
        onPress: handleMapPress,
        onMapReady: () => setIsMapReady(true),
        showsUserLocation: mapConfig.mobile.showsUserLocation,
        showsMyLocationButton: mapConfig.mobile.showsMyLocationButton,
        showsCompass: mapConfig.mobile.showsCompass,
        showsScale: mapConfig.mobile.showsScale,
        showsBuildings: mapConfig.mobile.showsBuildings,
        showsTraffic: mapConfig.mobile.showsTraffic,
        showsIndoors: mapConfig.mobile.showsIndoors,
        loadingEnabled: mapConfig.mobile.loadingEnabled,
        loadingIndicatorColor: mapConfig.mobile.loadingIndicatorColor,
        loadingBackgroundColor: mapConfig.mobile.loadingBackgroundColor,
      };
    }
  }, [region, mapConfig, mapStyle, handleMapPress]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Selecione uma localização</Text>
          <TouchableOpacity 
            onPress={handleConfirm} 
            style={styles.confirmButton}
            disabled={!selectedLocation}
          >
            <Text style={[styles.confirmButtonText, { color: colors.primary }]}>Confirmar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.mapContainer, {
          flex: mapStyle.container.flex,
          width: '100%',
          height: '100%'
        }]}>
          {!isMapReady && (
            <View style={[styles.loadingContainer, {
              position: 'absolute' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center' as const,
              alignItems: 'center' as const,
              backgroundColor: mapStyle.loadingContainer.backgroundColor
            }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          <MapView {...mapProps}>
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Local selecionado"
                pinColor={colors.primary}
              >
                <View style={[styles.markerContainer, {
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const
                }]}>
                  <MapPin size={32} color={colors.primary} fill={colors.primary} />
                </View>
              </Marker>
            )}
          </MapView>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  closeButton: {
    padding: 8,
  },
  confirmButton: {
    padding: 8,
  },
  confirmButtonText: {
    color: '#FF6B35', // Using primary color directly
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
