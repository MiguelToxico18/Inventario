import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { db, auth } from '../firebaseConfig'; // Asegúrate de importar auth
import { collection, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // Importar signOut

const HomeScreen = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [productosStockBajo, setProductosStockBajo] = useState([]);

  // Cargar productos desde Firestore en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Productos"), (snapshot) => {
      const productosData = [];
      const stockBajoData = [];

      snapshot.forEach((doc) => {
        const producto = { id: doc.id, ...doc.data() };
        productosData.push(producto);
        
        // Verificar si el producto tiene stock bajo
        if (producto.cantidadStock < 10) {
          stockBajoData.push(producto);
        }
      });

      setProductos(productosData);
      setProductosStockBajo(stockBajoData);

      // Mostrar alerta si hay productos con stock bajo
      if (stockBajoData.length > 0) {
        mostrarAlertaStockBajo(stockBajoData);
      }
    });

    return () => unsubscribe();
  }, []);

  // Función para cerrar sesión
  const handleCerrarSesion = () => {
    Alert.alert(
      "🔒 Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
           
              Alert.alert("✅ Sesión cerrada", "Has cerrado sesión correctamente");
                navigation.replace("Login"); // 👈
            } catch (error) {
              console.error("Error al cerrar sesión: ", error);
              Alert.alert("❌ Error", "Hubo un error al cerrar sesión");
            }
          }
        }
      ]
    );
  };

  // Función para mostrar alerta de stock bajo
  const mostrarAlertaStockBajo = (productosBajoStock) => {
    const nombresProductos = productosBajoStock.map(p => p.nombre).join(', ');
    
    Alert.alert(
      "⚠️ Alerta de Stock Bajo",
      `${productosBajoStock.length} producto(s) tienen stock menor a 10 unidades:\n\n${nombresProductos}`,
      [
        { 
          text: "Entendido", 
          style: "default" 
        },
        { 
          text: "Ver Detalles", 
          onPress: () => console.log("Navegar a detalles de stock")
        }
      ]
    );
  };

  // Función para eliminar un producto con confirmación
  const eliminarProducto = (idProducto, nombreProducto) => {
    Alert.alert(
      "🗑️ Eliminar Producto",
      `¿Estás seguro de que quieres eliminar "${nombreProducto}"?`,
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
              const docRef = doc(db, "Productos", idProducto);
              await deleteDoc(docRef);
              Alert.alert("✅ Éxito", "Producto eliminado exitosamente.");
            } catch (error) {
              console.error("Error eliminando producto: ", error);
              Alert.alert("❌ Error", "Hubo un error al eliminar el producto.");
            }
          }
        }
      ]
    );
  };

  // Función para obtener el estilo del stock según la cantidad
  const getStockStyle = (cantidad) => {
    if (cantidad < 5) {
      return styles.stockCritico;
    } else if (cantidad < 10) {
      return styles.stockBajo;
    } else if (cantidad < 20) {
      return styles.stockMedio;
    } else {
      return styles.stockAlto;
    }
  };

  // Función para obtener el texto del estado del stock
  const getEstadoStock = (cantidad) => {
    if (cantidad < 5) return "CRÍTICO";
    if (cantidad < 10) return "BAJO";
    if (cantidad < 20) return "MEDIO";
    return "ALTO";
  };

  return (
    <View style={styles.container}>
      {/* Header con título y botón de cerrar sesión */}
      <View style={styles.header}>
        <Text style={styles.title}>🏠 Sistema de Inventarios</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleCerrarSesion}>
          <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      
      {/* Banner de alerta de stock bajo */}
      {productosStockBajo.length > 0 && (
        <TouchableOpacity 
          style={styles.alertaBanner}
          onPress={() => mostrarAlertaStockBajo(productosStockBajo)}
        >
          <Text style={styles.alertaTexto}>
            ⚠️ {productosStockBajo.length} producto(s) con stock bajo
          </Text>
          <Text style={styles.alertaSubtexto}>
            Toca para ver detalles
          </Text>
        </TouchableOpacity>
      )}

      {/* Resumen de stock */}
      <View style={styles.resumenContainer}>
        <Text style={styles.resumenTitulo}>Resumen de Stock</Text>
        <View style={styles.resumenStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{productos.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.statCritico]}>
              {productos.filter(p => p.cantidadStock < 5).length}
            </Text>
            <Text style={styles.statLabel}>Crítico</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.statBajo]}>
              {productos.filter(p => p.cantidadStock >= 5 && p.cantidadStock < 10).length}
            </Text>
            <Text style={styles.statLabel}>Bajo</Text>
          </View>
        </View>
      </View>

      {/* Botones de navegación */}
      <View style={styles.botonesContainer}>
        <View style={styles.botonesFila}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('AgregarProducto')}
          >
            <Text style={styles.navButtonText}>➕ Agregar Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, styles.movimientosButton]}
            onPress={() => navigation.navigate('Movimientos')}
          >
            <Text style={styles.navButtonText}>📦 Movimientos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.botonesFila}>
          <TouchableOpacity 
            style={[styles.navButton, styles.categoriasButton]}
            onPress={() => navigation.navigate('AgregarCategoria')}
          >
            <Text style={styles.navButtonText}>🏷️ Categorías</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, styles.proveedoresButton]}
            onPress={() => navigation.navigate('AgregarProveedor')}
          >
            <Text style={styles.navButtonText}>👥 Proveedores</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabla de productos */}
      <ScrollView horizontal={true} style={styles.tableContainer}>
        <ScrollView vertical={true}>
          <Text style={styles.tableTitle}>📋 Lista de Productos</Text>

          {/* Cabecera de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.cellId]}>ID</Text>
            <Text style={[styles.headerCell, styles.cellNombre]}>Producto</Text>
            <Text style={[styles.headerCell, styles.cellCategoria]}>Categoría</Text>
            <Text style={[styles.headerCell, styles.cellPrecio]}>Precio</Text>
            <Text style={[styles.headerCell, styles.cellStock]}>Stock</Text>
            <Text style={[styles.headerCell, styles.cellEstado]}>Estado</Text>
            <Text style={[styles.headerCell, styles.cellProveedor]}>Proveedor</Text>
            <Text style={[styles.headerCell, styles.cellAcciones]}>Acciones</Text>
          </View>

          {/* Mostrar los productos */}
          {productos.length > 0 ? (
            productos.map((producto) => (
              <View 
                key={producto.id} 
                style={[
                  styles.productRow,
                  producto.cantidadStock < 5 && styles.filaCritica,
                  producto.cantidadStock < 10 && producto.cantidadStock >= 5 && styles.filaBaja
                ]}
              >
                <Text style={[styles.cell, styles.cellId]}>{producto.id}</Text>
                <Text style={[styles.cell, styles.cellNombre]}>{producto.nombre}</Text>
                <Text style={[styles.cell, styles.cellCategoria]}>{producto.categoria}</Text>
                <Text style={[styles.cell, styles.cellPrecio]}>${producto.precio}</Text>
                <Text style={[styles.cell, styles.cellStock, getStockStyle(producto.cantidadStock)]}>
                  {producto.cantidadStock}
                </Text>
                <Text style={[styles.cell, styles.cellEstado]}>
                  {getEstadoStock(producto.cantidadStock)}
                </Text>
                <Text style={[styles.cell, styles.cellProveedor]}>{producto.proveedor}</Text>
                <View style={[styles.cell, styles.cellAcciones]}>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => navigation.navigate('ModificarProducto', { productoId: producto.id })}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => eliminarProducto(producto.id, producto.nombre)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.sinProductos}>
              <Text style={styles.sinProductosTexto}>No hay productos disponibles</Text>
              <TouchableOpacity 
                style={styles.agregarPrimerButton}
                onPress={() => navigation.navigate('AgregarProducto')}
              >
                <Text style={styles.agregarPrimerButtonText}>Agregar Primer Producto</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  alertaBanner: {
    backgroundColor: '#FFEAA7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FDCB6E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  alertaTexto: {
    color: '#E17055',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  alertaSubtexto: {
    color: '#E17055',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  resumenContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resumenTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resumenStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statCritico: {
    color: '#FF3B30',
  },
  statBajo: {
    color: '#FF9500',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  botonesContainer: {
    marginBottom: 15,
  },
  botonesFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  movimientosButton: {
    backgroundColor: '#34C759',
  },
  categoriasButton: {
    backgroundColor: '#FF9500',
  },
  proveedoresButton: {
    backgroundColor: '#FF3B30',
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tableContainer: {
    flex: 1,
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  productRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filaCritica: {
    backgroundColor: '#FFE4E6',
  },
  filaBaja: {
    backgroundColor: '#FFF5E6',
  },
  cell: {
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  // Anchos específicos para cada columna
  cellId: { width: 80 },
  cellNombre: { width: 120 },
  cellCategoria: { width: 100 },
  cellPrecio: { width: 80 },
  cellStock: { width: 60 },
  cellEstado: { width: 70 },
  cellProveedor: { width: 100 },
  cellAcciones: { width: 120 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  stockCritico: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stockBajo: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
  stockMedio: {
    color: '#FFCC00',
  },
  stockAlto: {
    color: '#34C759',
  },
  sinProductos: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 10,
  },
  sinProductosTexto: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  agregarPrimerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  agregarPrimerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;