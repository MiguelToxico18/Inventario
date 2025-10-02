import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { db } from '../firebaseConfig';  // Asegúrate de tener la configuración correcta de Firebase
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'; // Asegúrate de que `doc` esté importado correctamente

const HomeScreen = ({ navigation }) => {
  const [productos, setProductos] = useState([]);  // Estado para productos

  // Cargar productos desde Firestore
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        // Cargar los productos desde Firebase
        const productosSnapshot = await getDocs(collection(db, "Productos"));
        const productosData = productosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductos(productosData);  // Actualizar el estado con los productos
      } catch (error) {
        console.error("Error al cargar los datos de productos: ", error);
      }
    };

    cargarProductos();
  }, []);

  // Función para eliminar un producto
  const eliminarProducto = async (idProducto) => {
    try {
      const docRef = doc(db, "Productos", idProducto); // Asegúrate de que `doc` esté correctamente definido
      await deleteDoc(docRef);
      setProductos(productos.filter(producto => producto.id !== idProducto)); // Actualizar la lista de productos
      Alert.alert("Éxito", "Producto eliminado exitosamente.");
    } catch (error) {
      console.error("Error eliminando producto: ", error);
      Alert.alert("Error", "Hubo un error al eliminar el producto.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido al sistema de inventarios</Text>
      
      {/* Botones de navegación */}
      <Button title="Ir a agregar categoría" onPress={() => navigation.navigate('AgregarCategoria')} />
      <Button title="Ir a agregar proveedor" onPress={() => navigation.navigate('AgregarProveedor')} />
      <Button title="Ir a agregar producto" onPress={() => navigation.navigate('AgregarProducto')} />
      <Button title="Ir a movimientos" onPress={() => navigation.navigate('Movimientos')} />
      
      {/* Botón adicional para ver movimientos */}
      <Button title="Ver Movimientos" onPress={() => navigation.navigate('VerMovimientos')} />

      {/* Mostrar la tabla de productos */}
      <ScrollView horizontal={true} style={styles.tableContainer}>
        <ScrollView vertical={true}>
          <Text style={styles.tableTitle}>Productos</Text>

          {/* Cabecera de la tabla */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Id</Text>
            <Text style={styles.headerCell}>Producto</Text>
            <Text style={styles.headerCell}>Categoría</Text>
            <Text style={styles.headerCell}>Precio</Text>
            <Text style={styles.headerCell}>Stock</Text>
            <Text style={styles.headerCell}>Proveedor</Text>
            <Text style={styles.headerCell}>Descripción</Text>
            <Text style={styles.headerCell}>Acciones</Text>
          </View>

          {/* Mostrar los productos */}
          {productos.length > 0 ? (
            productos.map((producto) => (
              <View key={producto.id} style={styles.productRow}>
                <Text style={styles.cell}>{producto.id}</Text>
                <Text style={styles.cell}>{producto.nombre}</Text>
                <Text style={styles.cell}>{producto.categoria}</Text>
                <Text style={styles.cell}>{producto.precio}</Text>
                <Text style={styles.cell}>{producto.cantidadStock}</Text>
                <Text style={styles.cell}>{producto.proveedor}</Text>
                <Text style={styles.cell}>{producto.descripcion}</Text>
                <View style={styles.actions}>
                  {/* Navegar a la pantalla de modificar producto */}
                  <Button
                    title="Modificar"
                    onPress={() => navigation.navigate('ModificarProducto', { productoId: producto.id })}
                  />
                  {/* Eliminar producto */}
                  <Button title="Eliminar" onPress={() => eliminarProducto(producto.id)} />
                </View>
              </View>
            ))
          ) : (
            <Text>No hay productos disponibles</Text>
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
    padding: 15, // Ajusté el padding para las celdas de encabezado
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14, // Aumenté el tamaño de la fuente para el encabezado
    padding: 10,  // Agregué más espacio entre las celdas
    textAlign: 'center',
    width: 100, // Definí un ancho fijo para cada celda
    flexWrap: 'wrap',  // Permite que el texto se ajuste dentro de la celda
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
    padding: 10, // Aumenté el padding para mayor espacio
    fontSize: 14, // Aumenté el tamaño de la fuente
    width: 100,  // Establecí un ancho fijo para cada celda
    flexWrap: 'wrap', // Permite que el texto se ajuste dentro de la celda
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
