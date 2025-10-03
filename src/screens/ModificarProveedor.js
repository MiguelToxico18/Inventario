import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const ModificarProveedor = ({ route, navigation }) => {
  const { proveedorId, proveedorNombre } = route.params;
  const [nuevoNombre, setNuevoNombre] = useState(proveedorNombre);
  const [isLoading, setIsLoading] = useState(false);

  const modificarProveedor = async () => {
    if (nuevoNombre.trim() === "") {
      Alert.alert("❌ Error", "Por favor ingresa un nombre válido");
      return;
    }

    if (nuevoNombre.trim() === proveedorNombre) {
      Alert.alert("ℹ️ Información", "No se realizaron cambios en el nombre del proveedor.");
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, "Proveedor", proveedorId);
      await updateDoc(docRef, {
        nombre: nuevoNombre.trim(),
      });

      Alert.alert(
        "✅ Éxito", 
        "Proveedor modificado exitosamente.",
        [{ text: "Aceptar", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error("Error modificando proveedor: ", e);
      Alert.alert("❌ Error", "Hubo un error al modificar el proveedor. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    if (nuevoNombre !== proveedorNombre) {
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
          <Text style={styles.title}>Editar Proveedor</Text>
          <Text style={styles.subtitle}>Modifica la información del proveedor</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formCard}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>ID del proveedor:</Text>
            <Text style={styles.infoValue}>{proveedorId}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Nombre actual:</Text>
            <Text style={styles.infoValue}>{proveedorNombre}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nuevo nombre del proveedor *</Text>
            <TextInput
              style={styles.input}
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              placeholder="Ingresa el nuevo nombre del proveedor"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            <Text style={styles.charCount}>
              {nuevoNombre.length} caracteres
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
                (!nuevoNombre.trim() || nuevoNombre.trim() === proveedorNombre) && styles.saveButtonDisabled
              ]}
              onPress={modificarProveedor}
              disabled={isLoading || !nuevoNombre.trim() || nuevoNombre.trim() === proveedorNombre}
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
            • Los cambios se reflejarán en todos los productos asociados a este proveedor
          </Text>
          <Text style={styles.infoText}>
            • El nombre debe ser único y descriptivo
          </Text>
          <Text style={styles.infoText}>
            • Mantén la consistencia en el formato de nombres
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
    backgroundColor: '#48bb78',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#48bb78',
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

export default ModificarProveedor;