// Configurações do mapa
import { Platform, ViewStyle } from 'react-native';

export type MapConfig = {
  // Configurações comuns
  defaultRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  
  // Configurações específicas para web
  web: {
    apiKey: string;
    defaultZoom: number;
    mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
    mapStyles: Array<{
      featureType: string;
      elementType: string;
      stylers: Array<{ [key: string]: any }>;
    }>;
  };
  
  // Configurações específicas para mobile
  mobile: {
    showsUserLocation: boolean;
    showsMyLocationButton: boolean;
    showsCompass: boolean;
    showsScale: boolean;
    showsBuildings: boolean;
    showsTraffic: boolean;
    showsIndoors: boolean;
    loadingEnabled: boolean;
    loadingIndicatorColor: string;
    loadingBackgroundColor: string;
  };
};

export const MAP_CONFIG: MapConfig = {
  // Configurações comuns
  defaultRegion: {
    latitude: -23.5505, // São Paulo
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Configurações específicas para web
  web: {
    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    defaultZoom: 15,
    mapType: 'roadmap', // roadmap, satellite, hybrid, terrain
    mapStyles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
  },
  
  // Configurações específicas para mobile
  mobile: {
    showsUserLocation: true,
    showsMyLocationButton: true,
    showsCompass: true,
    showsScale: true,
    showsBuildings: true,
    showsTraffic: false,
    showsIndoors: true,
    loadingEnabled: true,
    loadingIndicatorColor: '#666666',
    loadingBackgroundColor: '#eeeeee',
  },
};

// Helper para obter configurações baseadas na plataforma
export const getMapConfig = (): MapConfig & (MapConfig['web'] | MapConfig['mobile']) => ({
  ...MAP_CONFIG,
  ...(Platform.OS === 'web' ? MAP_CONFIG.web : MAP_CONFIG.mobile),
});

type MapStyles = {
  container: ViewStyle;
  map: ViewStyle;
  loadingContainer: ViewStyle;
  markerContainer: ViewStyle;
};

// Helper para obter o estilo do mapa baseado no tema
export const getMapStyle = (isDark: boolean): MapStyles => ({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
