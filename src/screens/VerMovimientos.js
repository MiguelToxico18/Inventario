import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { db } from '../firebaseConfig';  // Asegúrate de tener la configuración correcta de Firebase
import { collection, getDocs, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'; // Importar updateDoc para actualizar el stock

const VerMovimientos = ({ navigation }) => {
  const [movimientos, setMovimientos] = useState([]);  // Estado para los movimientos
  const [productos, setProductos] = useState({});  // Estado para los productos

  // Cargar productos desde Firestore
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosSnapshot = await getDocs(collection(db, "Productos"));
        const productosData = productosSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().nombre;  // Guardar los productos por su ID
          return acc;
        }, {});
        setProductos(productosData);  // Guardar los productos en el estado
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
            const productoNombre = productos[movimientoData.productoId];  // Obtener el nombre del producto
            return {
              id: doc.id,
              ...movimientoData,
              productoNombre: productoNombre || 'Producto no encontrado', // Si no se encuentra el producto, mostrar mensaje
            };
          })
        );
        setMovimientos(movimientosData);  // Actualizar el estado con los movimientos
      } catch (error) {
        console.error("Error al cargar los datos de movimientos: ", error);
        Alert.alert("Error", "Hubo un problema cargando los movimientos.");
      }
    };

    cargarMovimientos();
  }, [productos]);  // Dependencia de productos para que se recargue cuando cambien los productos

  // Función para eliminar un movimiento y actualizar el stock
  const eliminarMovimiento = async (idMovimiento, tipo, cantidad, productoId) => {
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

        // Si es una entrada, restamos la cantidad del stock
        if (tipo === 'entrada') {
          nuevoStock -= cantidad;
        }
        // Si es una salida, sumamos la cantidad al stock
        else if (tipo === 'salida') {
          nuevoStock += cantidad;
        }

        // 3. Actualizamos el stock del producto
        await updateDoc(productoRef, {
          cantidadStock: nuevoStock,
        });

        // 4. Actualizar la lista de movimientos después de eliminar uno
        setMovimientos(movimientos.filter(movimiento => movimiento.id !== idMovimiento));

        Alert.alert("Éxito", "Movimiento eliminado y stock actualizado correctamente.");
      } else {
        Alert.alert("Error", "Producto no encontrado.");
      }
    } catch (error) {
      console.error("Error eliminando movimiento: ", error);
      Alert.alert("Error", "Hubo un error al eliminar el movimiento y actualizar el stock.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movimientos Registrados</Text>

      {/* Mostrar la tabla de movimientos */}
      <ScrollView horizontal={true} style={styles.tableContainer}>
        <ScrollView vertical={true}>
          <Text style={styles.tableTitle}>Movimientos</Text>

          {/* Cabecera de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Id</Text>
            <Text style={styles.headerCell}>Fecha</Text>
            <Text style={styles.headerCell}>Cantidad</Text>
            <Text style={styles.headerCell}>Nota</Text>
            <Text style={styles.headerCell}>Tipo</Text>
            <Text style={styles.headerCell}>Producto</Text>
            <Text style={styles.headerCell}>Acciones</Text>
          </View>

          {/* Mostrar los movimientos */}
          {movimientos.length > 0 ? (
            movimientos.map((movimiento) => (
              <View key={movimiento.id} style={styles.productRow}>
                <Text style={styles.cell}>{movimiento.id}</Text>
                <Text style={styles.cell}>
                  {new Date(movimiento.fecha.seconds * 1000).toLocaleString()} {/* Convierte la fecha */}
                </Text>
                <Text style={styles.cell}>{movimiento.cantidad}</Text>
                <Text style={styles.cell}>{movimiento.nota}</Text>
                <Text style={styles.cell}>{movimiento.tipo}</Text>
                <Text style={styles.cell}>{movimiento.productoNombre}</Text> {/* Mostrar nombre del producto */}
                <View style={styles.actions}>
                  {/* Eliminar movimiento */}
                  <Button title="Eliminar" onPress={() => eliminarMovimiento(movimiento.id, movimiento.tipo, movimiento.cantidad, movimiento.productoId)} />
                </View>
              </View>
            ))
          ) : (
            <Text>No hay movimientos registrados</Text>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tableContainer: {
    flex: 1,
    marginBottom: 20,
    marginTop: 20,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ddd',
    padding: 15,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
    padding: 10,
    textAlign: 'center',
    width: 100,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
    width: 100,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VerMovimientos;
