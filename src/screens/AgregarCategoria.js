import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

const AgregarCategoria = ({ navigation }) => {
  const [categoria, setCategoria] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [lastId, setLastId] = useState('CAT000');
  const [categorias, setCategorias] = useState([]);

  // Función para obtener el último ID registrado
  const obtenerUltimoId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categoria"));
      let maxId = 0;

      querySnapshot.forEach(doc => {
        const id = doc.id.replace('CAT', '');
        const numId = parseInt(id);
        if (!isNaN(numId)) {
          maxId = Math.max(maxId, numId);
        }
      });

      setLastId(`CAT${String(maxId + 1).padStart(3, '0')}`);
    } catch (e) {
      console.error("Error obteniendo el último ID: ", e);
      setLastId('CAT001');
    }
  };

  // Función para obtener todas las categorías de Firestore
  const obtenerCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categoria"));
      const categoriasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
      }));
      setCategorias(categoriasData);
    } catch (e) {
      console.error("Error obteniendo las categorías: ", e);
    }
  };

  useEffect(() => {
    obtenerUltimoId();
    obtenerCategorias();
  }, []);

  const agregarCategoria = async () => {
    if (categoria.trim() === "") {
      Alert.alert("Error", "Por favor ingresa un nombre de categoría");
      return;
    }

    try {
      const docRef = doc(db, "Categoria", lastId);
      await setDoc(docRef, {
        nombre: categoria,
        idCategoria: lastId,
      });

      setMensaje(`Categoría "${categoria}" agregada con ID ${lastId}.`);
      Alert.alert("✅ Éxito", `Categoría "${categoria}" agregada exitosamente`);
      setCategoria('');
      obtenerUltimoId();
      obtenerCategorias();
    } catch (e) {
      console.error("Error agregando categoría: ", e);
      Alert.alert("❌ Error", "Hubo un error al agregar la categoría. Intenta de nuevo.");
    }
  };

  const eliminarCategoria = async (idCategoria, nombreCategoria) => {
    Alert.alert(
      "🗑️ Eliminar Categoría",
      `¿Estás seguro de que quieres eliminar la categoría "${nombreCategoria}"?`,
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
              await deleteDoc(doc(db, "Categoria", idCategoria));
              Alert.alert("✅ Éxito", "Categoría eliminada exitosamente.");
              obtenerCategorias();
            } catch (e) {
              console.error("Error eliminando categoría: ", e);
              Alert.alert("❌ Error", "Hubo un error al eliminar la categoría. Intenta de nuevo.");
            }
          }
        }
      ]
    );
  };

  const abrirModal = (id, nombre) => {
    navigation.navigate('ModificarCategoria', { categoriaId: id, categoriaNombre: nombre });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Categorías</Text>
        <Text style={styles.subtitle}>Administra las categorías de productos</Text>
      </View>

      {/* Formulario de agregar categoría */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Agregar Nueva Categoría</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la Categoría *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Electrónicos, Ropa, Hogar..."
            value={categoria}
            onChangeText={setCategoria}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={agregarCategoria}>
          <Text style={styles.primaryButtonText}>➕ Agregar Categoría</Text>
        </TouchableOpacity>

        {mensaje ? (
          <View style={styles.successMessage}>
            <Text style={styles.successMessageText}>{mensaje}</Text>
          </View>
        ) : null}
      </View>

      {/* Lista de categorías existentes */}
      <View style={styles.listCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías Existentes</Text>
          <Text style={styles.categoryCount}>{categorias.length} categorías</Text>
        </View>

        {categorias.length > 0 ? (
          <View style={styles.tableContainer}>
            {/* Header de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.idColumn]}>ID</Text>
              <Text style={[styles.headerCell, styles.nameColumn]}>Nombre</Text>
              <Text style={[styles.headerCell, styles.actionsColumn]}>Acciones</Text>
            </View>

            {/* Lista de categorías */}
            <FlatList
              data={categorias}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.categoryRow}>
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
                        onPress={() => eliminarCategoria(item.id, item.nombre)}
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
            <Text style={styles.emptyStateText}>No hay categorías registradas</Text>
            <Text style={styles.emptyStateSubtext}>
              Las categorías que agregues aparecerán aquí
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
  categoryCount: {
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
    backgroundColor: '#4299e1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4299e1',
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
    backgroundColor: '#34495e',
    paddingVertical: 16,
  },
  headerCell: {
    fontWeight: '600',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  categoryRow: {
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

export default AgregarCategoria;