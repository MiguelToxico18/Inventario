import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const AgregarProveedor = () => {
  const navigation = useNavigation();
  const [proveedor, setProveedor] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [proveedores, setProveedores] = useState([]);

  // Función para obtener el último ID y generar un nuevo ID único
  const obtenerUltimoId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Proveedor"));
      let maxId = 0;

      querySnapshot.forEach(doc => {
        const id = doc.id.replace('prov', '');
        const numId = parseInt(id);
        if (!isNaN(numId)) {
          maxId = Math.max(maxId, numId);
        }
      });

      return `prov${String(maxId + 1).padStart(3, '0')}`;
    } catch (e) {
      console.error("Error obteniendo el último ID: ", e);
      return 'prov001';
    }
  };

  // Función para obtener los proveedores
  const obtenerProveedores = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Proveedor"));
      const proveedoresData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
      }));
      setProveedores(proveedoresData);
    } catch (e) {
      console.error("Error obteniendo los proveedores: ", e);
    }
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const agregarProveedor = async () => {
    if (proveedor.trim() === "") {
      Alert.alert("❌ Error", "Por favor ingresa un nombre de proveedor");
      return;
    }

    try {
      const nuevoId = await obtenerUltimoId();

      const docRef = doc(db, "Proveedor", nuevoId);
      await setDoc(docRef, {
        nombre: proveedor,
        idProveedor: nuevoId,
      });

      setMensaje(`Proveedor "${proveedor}" agregado con ID ${nuevoId}.`);
      Alert.alert("✅ Éxito", `Proveedor "${proveedor}" agregado exitosamente`);
      setProveedor('');
      obtenerProveedores();
    } catch (e) {
      console.error("Error agregando proveedor: ", e);
      Alert.alert("❌ Error", "Hubo un error al agregar el proveedor. Intenta de nuevo.");
    }
  };

  const eliminarProveedor = async (idProveedor, nombreProveedor) => {
    Alert.alert(
      "🗑️ Eliminar Proveedor",
      `¿Estás seguro de que quieres eliminar el proveedor "${nombreProveedor}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Proveedor", idProveedor));
              Alert.alert("✅ Éxito", "Proveedor eliminado exitosamente.");
              obtenerProveedores();
            } catch (e) {
              console.error("Error eliminando proveedor: ", e);
              Alert.alert("❌ Error", "Hubo un error al eliminar el proveedor. Intenta de nuevo.");
            }
          }
        }
      ]
    );
  };

  const abrirModal = (id, nombre) => {
    navigation.navigate('ModificarProveedor', {
      proveedorId: id,
      proveedorNombre: nombre,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Proveedores</Text>
        <Text style={styles.subtitle}>Administra los proveedores de productos</Text>
      </View>

      {/* Formulario de agregar proveedor */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Agregar Nuevo Proveedor</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Proveedor *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Distribuidora XYZ, Importaciones ABC..."
            value={proveedor}
            onChangeText={setProveedor}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={agregarProveedor}>
          <Text style={styles.primaryButtonText}>👥 Agregar Proveedor</Text>
        </TouchableOpacity>

        {mensaje ? (
          <View style={styles.successMessage}>
            <Text style={styles.successMessageText}>{mensaje}</Text>
          </View>
        ) : null}
      </View>

      {/* Lista de proveedores existentes */}
      <View style={styles.listCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Proveedores Existentes</Text>
          <Text style={styles.providerCount}>{proveedores.length} proveedores</Text>
        </View>

        {proveedores.length > 0 ? (
          <View style={styles.tableContainer}>
            {/* Header de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.idColumn]}>ID</Text>
              <Text style={[styles.headerCell, styles.nameColumn]}>Nombre</Text>
              <Text style={[styles.headerCell, styles.actionsColumn]}>Acciones</Text>
            </View>

            {/* Lista de proveedores */}
            <FlatList
              data={proveedores}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.providerRow}>
                  <View style={[styles.cell, styles.idColumn]}>
                    <Text style={styles.idText}>{item.id}</Text>
                  </View>
                  
                  <View style={[styles.cell, styles.nameColumn]}>
                    <Text style={styles.nameText}>{item.nombre}</Text>
                  </View>
                  
                  <View style={[styles.cell, styles.actionsColumn]}>
                    <View style={styles.actions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => abrirModal(item.id, item.nombre)}
                      >
                        <Text style={styles.editButtonText}>✏️</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => eliminarProveedor(item.id, item.nombre)}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={item => item.id}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay proveedores registrados</Text>
            <Text style={styles.emptyStateSubtext}>
              Los proveedores que agregues aparecerán aquí
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 50,
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
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
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
  listCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  providerCount: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2d3748',
  },
  primaryButton: {
    backgroundColor: '#48bb78',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#48bb78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessage: {
    backgroundColor: '#c6f6d5',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#38a169',
  },
  successMessageText: {
    color: '#2d3748',
    fontSize: 14,
    fontWeight: '500',
  },
  tableContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2d3748',
    paddingVertical: 16,
  },
  headerCell: {
    fontWeight: '600',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  providerRow: {
    flexDirection: 'row',
    backgroundColor: '#f7fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cell: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  // Column widths
  idColumn: {
    width: 100,
  },
  nameColumn: {
    flex: 1,
  },
  actionsColumn: {
    width: 120,
  },
  idText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a5568',
    textAlign: 'center',
  },
  nameText: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#ed8936',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#f56565',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#a0aec0',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#cbd5e0',
    textAlign: 'center',
  },
});

export default AgregarProveedor;