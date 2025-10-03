import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Alert, 
  StyleSheet, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const ModificarCategoria = ({ route, navigation }) => {
  const { categoriaId, categoriaNombre } = route.params;
  const [categoriaEdicion, setCategoriaEdicion] = useState(categoriaNombre);
  const [isLoading, setIsLoading] = useState(false);

  // Función para modificar la categoría en la base de datos
  const modificarCategoria = async () => {
    if (categoriaEdicion.trim() === "") {
      Alert.alert("❌ Error", "El nombre de la categoría no puede estar vacío.");
      return;
    }

    if (categoriaEdicion.trim() === categoriaNombre) {
      Alert.alert("ℹ️ Información", "No se realizaron cambios en el nombre de la categoría.");
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, "Categoria", categoriaId);
      await updateDoc(docRef, {
        nombre: categoriaEdicion.trim(),
      });

      Alert.alert(
        "✅ Éxito", 
        "Categoría modificada exitosamente.",
        [{ text: "Aceptar", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error("Error modificando categoría: ", e);
      Alert.alert("❌ Error", "Hubo un error al modificar la categoría. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    if (categoriaEdicion !== categoriaNombre) {
      Alert.alert(
        "⚠️ Cambios sin guardar",
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres cancelar?",
        [
          { text: "Seguir editando", style: "cancel" },
          { text: "Descartar cambios", style: "destructive", onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Editar Categoría</Text>
          <Text style={styles.subtitle}>Modifica el nombre de la categoría</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formCard}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>ID de la categoría:</Text>
            <Text style={styles.infoValue}>{categoriaId}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Nombre actual:</Text>
            <Text style={styles.infoValue}>{categoriaNombre}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nuevo nombre de la categoría *</Text>
            <TextInput
              style={styles.input}
              value={categoriaEdicion}
              onChangeText={setCategoriaEdicion}
              placeholder="Ingresa el nuevo nombre de la categoría"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            <Text style={styles.charCount}>
              {categoriaEdicion.length} caracteres
            </Text>
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelar}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>✕ Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!categoriaEdicion.trim() || categoriaEdicion.trim() === categoriaNombre) && styles.saveButtonDisabled
              ]}
              onPress={modificarCategoria}
              disabled={isLoading || !categoriaEdicion.trim() || categoriaEdicion.trim() === categoriaNombre}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Guardando..." : "💾 Guardar Cambios"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Información importante</Text>
          <Text style={styles.infoText}>
            • Los cambios se reflejarán en todos los productos asociados a esta categoría
          </Text>
          <Text style={styles.infoText}>
            • El nombre debe ser único y descriptivo
          </Text>
          <Text style={styles.infoText}>
            • No se permiten nombres vacíos o solo espacios
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default ModificarCategoria;