import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { db } from '../firebaseConfig';  // Asegúrate de importar la configuración de Firebase
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';  // Asegurarte de importar los métodos correctamente
import { Picker } from '@react-native-picker/picker';  // Importar Picker para categorías y proveedores

const ModificarProducto = ({ route, navigation }) => {
  const { productoId } = route.params;  // Obtener el ID del producto desde los parámetros de la navegación
  const [producto, setProducto] = useState(null);  // Estado para almacenar el producto a modificar
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  // Cargar datos de categorías y proveedores
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const categoriasSnapshot = await getDocs(collection(db, "Categoria"));
        const proveedoresSnapshot = await getDocs(collection(db, "Proveedor"));

        const categoriasData = categoriasSnapshot.docs.map(doc => doc.data().nombre);
        const proveedoresData = proveedoresSnapshot.docs.map(doc => doc.data().nombre);

        setCategorias(categoriasData);
        setProveedores(proveedoresData);

        // Obtener el producto a modificar desde Firestore
        const productoDoc = await getDoc(doc(db, "Productos", productoId));
        if (productoDoc.exists()) {
          const data = productoDoc.data();
          setProducto(data);
          setNombre(data.nombre);
          setCategoria(data.categoria);
          setProveedor(data.proveedor);
          setDescripcion(data.descripcion);
          setPrecio(data.precio.toString());
        } else {
          console.log("Producto no encontrado!");
          Alert.alert("Error", "Producto no encontrado");
        }
      } catch (error) {
        console.error("Error al cargar datos: ", error);
        Alert.alert("Error", "Hubo un error al cargar los datos.");
      }
    };

    cargarDatos();
  }, [productoId]);

  const modificarProducto = async () => {
    if (!nombre || !categoria || !proveedor || !descripcion || !precio) {
      alert("Por favor, llena todos los campos");
      return;
    }

    if (isNaN(precio)) {
      alert("El precio debe ser un número");
      return;
    }

    try {
      const docRef = doc(db, "Productos", productoId);
      await updateDoc(docRef, {
        nombre,
        categoria,
        proveedor,
        descripcion,
        precio: parseFloat(precio),
      });

      Alert.alert("Éxito", "Producto modificado exitosamente");
      navigation.goBack(); // Regresar a la pantalla anterior
    } catch (e) {
      console.error("Error modificando producto: ", e);
      Alert.alert("Error", "Hubo un error al modificar el producto.");
    }
  };

  if (!producto) {
    return <Text>Cargando producto...</Text>;  // Mostrar un mensaje mientras cargamos el producto
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modificar Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del Producto"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text>Selecciona una categoría:</Text>
      <Picker
        selectedValue={categoria}
        onValueChange={(itemValue) => setCategoria(itemValue)}
      >
        {categorias.length > 0 ? (
          categorias.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))
        ) : (
          <Picker.Item label="Cargando categorías..." value="" />
        )}
      </Picker>

      <TextInput
        
        style={styles.input}
        placeholder="Descripción del Producto"
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={styles.input}
        placeholder="Precio del Producto"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
      />

      <Text>Selecciona un proveedor:</Text>
      <Picker
        selectedValue={proveedor}
        onValueChange={(itemValue) => setProveedor(itemValue)}
      >
        {proveedores.length > 0 ? (
          proveedores.map((prov, index) => (
            <Picker.Item key={index} label={prov} value={prov} />
          ))
        ) : (
          <Picker.Item label="Cargando proveedores..." value="" />
        )}
      </Picker>

      <Button title="Modificar Producto" onPress={modificarProducto} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default ModificarProducto;
