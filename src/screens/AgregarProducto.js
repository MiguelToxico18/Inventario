import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { db } from '../firebaseConfig';  // Importar la configuración de Firebase
import { collection, getDocs, addDoc } from 'firebase/firestore';  // Importar Firestore
import { Picker } from '@react-native-picker/picker';  // Importar Picker para categorías y proveedores

const AgregarProducto = () => {
  const [nombre, setNombre] = useState('');  // Nombre del producto
  const [categoria, setCategoria] = useState('');  // Categoría seleccionada
  const [proveedor, setProveedor] = useState('');  // Proveedor seleccionado
  const [descripcion, setDescripcion] = useState('');  // Descripción del producto
  const [cantidadStock, setCantidadStock] = useState('');  // Cantidad en stock
  const [precio, setPrecio] = useState('');  // Precio del producto
  const [categorias, setCategorias] = useState([]);  // Lista de categorías
  const [proveedores, setProveedores] = useState([]);  // Lista de proveedores

  // Cargar categorías y proveedores desde Firestore
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const categoriasSnapshot = await getDocs(collection(db, "Categoria"));
        const proveedoresSnapshot = await getDocs(collection(db, "Proveedor"));

        // Verificar si las categorías y proveedores existen
        const categoriasData = categoriasSnapshot.docs.map(doc => doc.data().nombre);
        const proveedoresData = proveedoresSnapshot.docs.map(doc => doc.data().nombre);

        // Actualizar el estado con los datos obtenidos
        setCategorias(categoriasData);
        setProveedores(proveedoresData);
      } catch (error) {
        console.error("Error al cargar los datos de Firestore: ", error);
      }
    };

    cargarDatos();
  }, []);

  // Función para agregar el producto a Firestore
  const agregarProducto = async () => {
    if (nombre.trim() === "" || categoria === "" || proveedor === "" || descripcion.trim() === "" || cantidadStock === "" || precio === "") {
      alert("Por favor, llena todos los campos");
      return;
    }

    try {
      // Lógica para agregar el producto a Firestore
      await addDoc(collection(db, "Productos"), {
        cantidadStock,
        categoria,
        descripcion,
        nombre,
        precio,
        proveedor,
      });

      Alert.alert("Éxito", "Producto agregado exitosamente");
      setNombre('');
      setCategoria('');
      setProveedor('');
      setDescripcion('');
      setCantidadStock('');
      setPrecio('');
    } catch (e) {
      console.error("Error agregando producto: ", e);
      Alert.alert("Error", "Hubo un error al agregar el producto. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Primero el campo de cantidadStock */}
      <TextInput
        style={styles.input}
        placeholder="Cantidad en stock"
        value={cantidadStock}
        onChangeText={setCantidadStock}  // Actualiza el estado con el valor del input
        keyboardType="numeric"
      />

      {/* Luego el campo de categoria */}
      <Text>Selecciona una categoría:</Text>
      <Picker
        selectedValue={categoria}
        onValueChange={(itemValue) => setCategoria(itemValue)}
      >
        <Picker.Item label="Selecciona una categoría" value="" />
        {categorias.length > 0 ? (
          categorias.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))
        ) : (
          <Picker.Item label="Cargando categorías..." value="" />
        )}
      </Picker>

      {/* Luego el campo de descripción */}
      <TextInput
        style={styles.input}
        placeholder="Descripción del Producto"
        value={descripcion}
        onChangeText={setDescripcion}  // Actualiza el estado con el valor del input
      />

      {/* Luego el campo de nombre */}
      <TextInput
        style={styles.input}
        placeholder="Nombre del Producto"
        value={nombre}
        onChangeText={setNombre}  // Actualiza el estado con el valor del input
      />

      {/* Después el campo de precio */}
      <TextInput
        style={styles.input}
        placeholder="Precio del Producto"
        value={precio}
        onChangeText={setPrecio}  // Actualiza el estado con el valor del input
        keyboardType="numeric"
      />

      {/* Después el campo de proveedor */}
      <Text>Selecciona un proveedor:</Text>
      <Picker
        selectedValue={proveedor}
        onValueChange={(itemValue) => setProveedor(itemValue)}
      >
        <Picker.Item label="Selecciona un proveedor" value="" />
        {proveedores.length > 0 ? (
          proveedores.map((prov, index) => (
            <Picker.Item key={index} label={prov} value={prov} />
          ))
        ) : (
          <Picker.Item label="Cargando proveedores..." value="" />
        )}
      </Picker>

      {/* Botón para agregar producto */}
      <Button title="Agregar Producto" onPress={agregarProducto} />
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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default AgregarProducto;
 