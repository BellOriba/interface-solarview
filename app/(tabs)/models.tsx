import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit, Trash2, Filter } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';
import { PanelModel } from '@/types';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/colors';

export default function ModelsScreen() {
  const [models, setModels] = useState<PanelModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<PanelModel | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [capacity, setCapacity] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [type, setType] = useState('');
  
  // Filter fields
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [minCapacityFilter, setMinCapacityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    if (!user?.api_key) return;
    
    setIsLoading(true);
    try {
      const filters: any = {};
      if (manufacturerFilter) filters.manufacturer = manufacturerFilter;
      if (minCapacityFilter) filters.min_capacity = parseFloat(minCapacityFilter);
      if (typeFilter) filters.panel_type = typeFilter;

      const data = await apiService.getPanelModels(user.api_key, filters);
      setModels(data);
    } catch (error) {
      Alert.alert(t('error'), 'Error loading models');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setManufacturer('');
    setCapacity('');
    setEfficiency('');
    setType('');
    setEditingModel(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (model: PanelModel) => {
    setName(model.name);
    setManufacturer(model.manufacturer);
    setCapacity(model.capacity.toString());
    setEfficiency(model.efficiency.toString());
    setType(model.type);
    setEditingModel(model);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || !manufacturer || !capacity || !efficiency || !type) {
      Alert.alert(t('error'), 'Please fill all fields');
      return;
    }

    if (!user?.api_key) return;

    setIsLoading(true);
    try {
      const modelData = {
        name,
        manufacturer,
        capacity: parseFloat(capacity),
        efficiency: parseFloat(efficiency),
        type,
      };

      if (editingModel) {
        await apiService.updatePanelModel(user.api_key, editingModel.id, modelData);
      } else {
        await apiService.createPanelModel(user.api_key, modelData);
      }

      setShowModal(false);
      resetForm();
      loadModels();
    } catch (error) {
      Alert.alert(t('error'), 'Error saving model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (model: PanelModel) => {
    Alert.alert(
      t('delete'),
      `Delete ${model.name}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            if (!user?.api_key) return;
            try {
              await apiService.deletePanelModel(user.api_key, model.id);
              loadModels();
            } catch (error) {
              Alert.alert(t('error'), 'Error deleting model');
            }
          },
        },
      ]
    );
  };

  const renderModel = ({ item }: { item: PanelModel }) => (
    <Card style={styles.modelCard}>
      <View style={styles.modelHeader}>
        <View style={styles.modelInfo}>
          <Text style={styles.modelName}>{item.name}</Text>
          <Text style={styles.modelManufacturer}>{item.manufacturer}</Text>
        </View>
        <View style={styles.modelActions}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.modelDetails}>
        <Text style={styles.modelDetail}>
          {t('capacity')}: {item.capacity} kWp
        </Text>
        <Text style={styles.modelDetail}>
          {t('efficiency')}: {item.efficiency}%
        </Text>
        <Text style={styles.modelDetail}>
          {t('type')}: {item.type}
        </Text>
      </View>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...Typography.h2,
      color: colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    content: {
      flex: 1,
      padding: Spacing.lg,
    },
    modelCard: {
      marginBottom: Spacing.md,
    },
    modelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    modelInfo: {
      flex: 1,
    },
    modelName: {
      ...Typography.h3,
      color: colors.text,
      fontSize: 18,
    },
    modelManufacturer: {
      ...Typography.body2,
      color: colors.textSecondary,
    },
    modelActions: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    modelDetails: {
      gap: Spacing.xs,
    },
    modelDetail: {
      ...Typography.body2,
      color: colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: Spacing.lg,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      maxHeight: '90%',
    },
    modalTitle: {
      ...Typography.h2,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    modalActions: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
    actionButton: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('models')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Filter size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openCreateModal}>
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={models}
        renderItem={renderModel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshing={isLoading}
        onRefresh={loadModels}
      />

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingModel ? t('editModel') : t('addModel')}
            </Text>
            
            <Input
              label={t('modelName')}
              value={name}
              onChangeText={setName}
            />
            
            <Input
              label={t('manufacturer')}
              value={manufacturer}
              onChangeText={setManufacturer}
            />
            
            <Input
              label={t('capacity')}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
            
            <Input
              label={t('efficiency')}
              value={efficiency}
              onChangeText={setEfficiency}
              keyboardType="numeric"
            />
            
            <Input
              label={t('type')}
              value={type}
              onChangeText={setType}
            />

            <View style={styles.modalActions}>
              <Button
                title={t('cancel')}
                onPress={() => setShowModal(false)}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title={t('save')}
                onPress={handleSave}
                loading={isLoading}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros</Text>
            
            <Input
              label={t('manufacturer')}
              value={manufacturerFilter}
              onChangeText={setManufacturerFilter}
            />
            
            <Input
              label="Capacidade Mínima (kWp)"
              value={minCapacityFilter}
              onChangeText={setMinCapacityFilter}
              keyboardType="numeric"
            />
            
            <Input
              label={t('type')}
              value={typeFilter}
              onChangeText={setTypeFilter}
            />

            <View style={styles.modalActions}>
              <Button
                title="Limpar"
                onPress={() => {
                  setManufacturerFilter('');
                  setMinCapacityFilter('');
                  setTypeFilter('');
                }}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Aplicar"
                onPress={() => {
                  setShowFilters(false);
                  loadModels();
                }}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}