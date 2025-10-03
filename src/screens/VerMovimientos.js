import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const VerMovimientos = ({ navigation }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState({});

  // Cargar productos desde Firestore
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosSnapshot = await getDocs(collection(db, "Productos"));
        const productosData = productosSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().nombre;
          return acc;
        }, {});
        setProductos(productosData);
      } catch (error) {
        console.error("Error al cargar productos: ", error);
        Alert.alert("Error", "Hubo un problema cargando los productos.");
      }
    };

    cargarProductos();
  }, []);

  // Cargar movimientos desde Firestore
  useEffect(() => {
    const cargarMovimientos = async () => {
      try {
        const movimientosSnapshot = await getDocs(collection(db, "Movimientos"));
        const movimientosData = await Promise.all(
          movimientosSnapshot.docs.map(async (doc) => {
            const movimientoData = doc.data();
            const productoNombre = productos[movimientoData.productoId];
            return {
              id: doc.id,
              ...movimientoData,
              productoNombre: productoNombre || 'Producto no encontrado',
            };
          })
        );
        // Ordenar movimientos por fecha (más recientes primero)
        movimientosData.sort((a, b) => b.fecha.seconds - a.fecha.seconds);
        setMovimientos(movimientosData);
      } catch (error) {
        console.error("Error al cargar los datos de movimientos: ", error);
        Alert.alert("Error", "Hubo un problema cargando los movimientos.");
      }
    };

    cargarMovimientos();
  }, [productos]);

  // Función para eliminar un movimiento y actualizar el stock
  const eliminarMovimiento = async (idMovimiento, tipo, cantidad, productoId, productoNombre) => {
    Alert.alert(
      "🗑️ Eliminar Movimiento",
      `¿Estás seguro de que quieres eliminar este movimiento de ${tipo} para "${productoNombre}"?`,
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
              // 1. Eliminar el movimiento
              const movimientoRef = doc(db, "Movimientos", idMovimiento);
              await deleteDoc(movimientoRef);
              
              // 2. Ajustar el stock del producto dependiendo del tipo de movimiento
              const productoRef = doc(db, "Productos", productoId);
              const productoSnapshot = await getDoc(productoRef);
              
              if (productoSnapshot.exists()) {
                const productoData = productoSnapshot.data();
                let nuevoStock = productoData.cantidadStock;

                if (tipo === 'entrada') {
                  nuevoStock -= cantidad;
                } else if (tipo === 'salida') {
                  nuevoStock += cantidad;
                }

                // 3. Actualizamos el stock del producto
                await updateDoc(productoRef, {
                  cantidadStock: nuevoStock,
                });

                // 4. Actualizar la lista de movimientos después de eliminar uno
                setMovimientos(movimientos.filter(movimiento => movimiento.id !== idMovimiento));

                Alert.alert("✅ Éxito", "Movimiento eliminado y stock actualizado correctamente.");
              } else {
                Alert.alert("Error", "Producto no encontrado.");
              }
            } catch (error) {
              console.error("Error eliminando movimiento: ", error);
              Alert.alert("❌ Error", "Hubo un error al eliminar el movimiento y actualizar el stock.");
            }
          }
        }
      ]
    );
  };

  // Función para obtener el color según el tipo de movimiento
  const getTipoColor = (tipo) => {
    return tipo === 'entrada' ? '#48bb78' : '#f56565';
  };

  // Función para obtener el icono según el tipo de movimiento
  const getTipoIcono = (tipo) => {
    return tipo === 'entrada' ? '📥' : '📤';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Movimientos</Text>
        <Text style={styles.subtitle}>Registro de entradas y salidas de inventario</Text>
      </View>

      {/* Resumen de movimientos */}
      <View style={styles.resumenContainer}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenNumero}>{movimientos.length}</Text>
          <Text style={styles.resumenLabel}>Total Movimientos</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={[styles.resumenNumero, styles.entradaColor]}>
            {movimientos.filter(m => m.tipo === 'entrada').length}
          </Text>
          <Text style={styles.resumenLabel}>Entradas</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={[styles.resumenNumero, styles.salidaColor]}>
            {movimientos.filter(m => m.tipo === 'salida').length}
          </Text>
          <Text style={styles.resumenLabel}>Salidas</Text>
        </View>
      </View>

      {/* Lista de movimientos */}
      <View style={styles.listaContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
          <Text style={styles.movimientosCount}>{movimientos.length} registros</Text>
        </View>

        {movimientos.length > 0 ? (
          <ScrollView 
            style={styles.movimientosList}
            showsVerticalScrollIndicator={false}
          >
            {movimientos.map((movimiento) => (
              <View key={movimiento.id} style={styles.movimientoCard}>
                <View style={styles.movimientoHeader}>
                  <View style={styles.productoInfo}>
                    <Text style={styles.productoNombre}>{movimiento.productoNombre}</Text>
                    <View style={[styles.tipoBadge, { backgroundColor: getTipoColor(movimiento.tipo) }]}>
                      <Text style={styles.tipoText}>
                        {getTipoIcono(movimiento.tipo)} {movimiento.tipo.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cantidadText}>
                    {movimiento.tipo === 'entrada' ? '+' : '-'}{movimiento.cantidad} unidades
                  </Text>
                </View>

                <View style={styles.movimientoDetails}>
                  <Text style={styles.fechaText}>
                    📅 {new Date(movimiento.fecha.seconds * 1000).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  {movimiento.nota && (
                    <Text style={styles.notaText}>📝 {movimiento.nota}</Text>
                  )}
                  <Text style={styles.idText}>ID: {movimiento.id}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => eliminarMovimiento(
                      movimiento.id, 
                      movimiento.tipo, 
                      movimiento.cantidad, 
                      movimiento.productoId,
                      movimiento.productoNombre
                    )}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📊</Text>
            <Text style={styles.emptyStateText}>No hay movimientos registrados</Text>
            <Text style={styles.emptyStateSubtext}>
              Los movimientos de entrada y salida aparecerán aquí
            </Text>
          </View>
        )}
      </View>
    </View>
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
  resumenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  resumenCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resumenNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4299e1',
    marginBottom: 4,
  },
  entradaColor: {
    color: '#48bb78',
  },
  salidaColor: {
    color: '#f56565',
  },
  resumenLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  listaContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  movimientosCount: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  movimientosList: {
    flex: 1,
  },
  movimientoCard: {
    backgroundColor: '#f7fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  movimientoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 6,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  tipoText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  movimientoDetails: {
    marginBottom: 12,
  },
  fechaText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  notaText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  idText: {
    fontSize: 10,
    color: '#a0aec0',
  },
  actions: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#f56565',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
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

export default VerMovimientos;