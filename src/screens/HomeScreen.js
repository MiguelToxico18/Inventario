import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';  // Asegúrate de tener la configuración correcta de Firebase
import { collection, getDocs } from 'firebase/firestore'; // Importar Firestore

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido al sistema de inventariossss</Text>
        {/* Botones de navegación */}
      <Button title="Ir a agregar categoría" onPress={() => navigation.navigate('AgregarCategoria')} />
      <Button title="Ir a agregar proveedor" onPress={() => navigation.navigate('AgregarProveedor')} />
      <Button title="Ir a agregar producto" onPress={() => navigation.navigate('AgregarProducto')} />
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
                <Text style={styles.cell}>{producto.proveedor}</Text>  {/* Proveedor */}
                <Text style={styles.cell}>{producto.descripcion}</Text>  {/* Descripción */}
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
    padding: 10,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12, // Reduje el tamaño de la fuente para que se ajuste
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    padding: 5,
    fontSize: 12, // Reduje el tamaño de la fuente para que se ajuste
  },
});

export default HomeScreen;
