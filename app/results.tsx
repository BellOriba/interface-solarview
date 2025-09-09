import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Compass } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalculationResult } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/colors';

const screenWidth = Dimensions.get('window').width;

export default function ResultsScreen() {
  const { resultData, coordinates } = useLocalSearchParams<{
    resultData: string;
    coordinates: string;
  }>();

  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = isDark ? Colors.dark : Colors.light;

  if (!resultData || !coordinates) {
    return null;
  }

  const result: CalculationResult = JSON.parse(resultData);
  const coords = JSON.parse(coordinates);

  const chartData = {
    labels: [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ],
    datasets: [
      {
        data: result.outputs.monthly.map(m => m.E_m),
        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const openCompass = () => {
    router.push({
      pathname: '/compass',
      params: { 
        optimalAzimuth: result.meta.optimal_azimuth.toString(),
      },
    });
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
    },
    section: {
      margin: Spacing.lg,
    },
    sectionTitle: {
      ...Typography.h3,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.md,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    statValue: {
      ...Typography.h2,
      color: colors.primary,
      marginBottom: Spacing.xs,
    },
    statLabel: {
      ...Typography.body2,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    chartContainer: {
      alignItems: 'center',
    },
    compassSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.lg,
    },
    compassInfo: {
      flex: 1,
    },
    compassValue: {
      ...Typography.h3,
      color: colors.text,
    },
    compassLabel: {
      ...Typography.body2,
      color: colors.textSecondary,
    },
    compassButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('results')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo da Produção</Text>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>
                {result.outputs.totals.E_y.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>kWh/ano</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>
                {(result.outputs.totals.E_y / 12).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>kWh/mês (média)</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>
                {result.meta.optimal_inclination.toFixed(0)}°
              </Text>
              <Text style={styles.statLabel}>Inclinação Ótima</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>
                {result.meta.optimal_azimuth.toFixed(0)}°
              </Text>
              <Text style={styles.statLabel}>Azimute Ótimo</Text>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('monthlyProduction')}</Text>
          <Card>
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 16 }}
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direção Ótima</Text>
          <Card>
            <View style={styles.compassSection}>
              <View style={styles.compassInfo}>
                <Text style={styles.compassValue}>
                  {result.meta.optimal_azimuth.toFixed(0)}° Sul
                </Text>
                <Text style={styles.compassLabel}>
                  Direção recomendada para os painéis
                </Text>
              </View>
              <TouchableOpacity
                style={styles.compassButton}
                onPress={openCompass}
              >
                <Compass size={24} color={colors.primary} />
                <Text style={{ color: colors.primary }}>
                  {t('openCompass')}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('coordinates')}</Text>
          <Card>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {coords.lat.toFixed(6)}
                </Text>
                <Text style={styles.statLabel}>{t('latitude')}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {coords.lon.toFixed(6)}
                </Text>
                <Text style={styles.statLabel}>{t('longitude')}</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}