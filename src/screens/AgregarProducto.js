import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { db } from '../firebaseConfig';  // Importar la configuración de Firebase
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';  // Importar Firestore
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
  const [lastId, setLastId] = useState('prod000');  // Estado para manejar el último ID registrado

  // Cargar categorías, proveedores y el último ID de productos desde Firestore
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const categoriasSnapshot = await getDocs(collection(db, "Categoria"));
        const proveedoresSnapshot = await getDocs(collection(db, "Proveedor"));
        const productosSnapshot = await getDocs(collection(db, "Productos"));

        // Verificar si las categorías y proveedores existen
        const categoriasData = categoriasSnapshot.docs.map(doc => doc.data().nombre);
        const proveedoresData = proveedoresSnapshot.docs.map(doc => doc.data().nombre);

        // Obtener el último ID de productos
        let maxId = 0;
        productosSnapshot.forEach(doc => {
          const id = doc.id.replace('prod', '');  // Obtener solo la parte numérica del ID (sin "prod")
          const numId = parseInt(id); // Convertir la parte numérica a un número
          if (!isNaN(numId)) {
            maxId = Math.max(maxId, numId);  // Obtener el ID más alto
          }
        });

        // Actualizar el estado con los datos obtenidos
        setCategorias(categoriasData);
        setProveedores(proveedoresData);
        setLastId(`prod${String(maxId + 1).padStart(3, '0')}`);  // Incrementar el ID y asignarlo a lastId
      } catch (error) {
        console.error("Error al cargar los datos de Firestore: ", error);
        Alert.alert("Error", "Hubo un error al cargar los datos de categorías, proveedores o productos.");
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

    // Validar que cantidad y precio sean números
    if (isNaN(cantidadStock) || isNaN(precio)) {
      alert("La cantidad en stock y el precio deben ser valores numéricos");
      return;
    }

    try {
      // Lógica para agregar el producto a Firestore con el ID generado
      const docRef = doc(db, "Productos", lastId); // Usamos el lastId como el ID del documento
      await setDoc(docRef, {
        cantidadStock: parseInt(cantidadStock),  // Convertir a número entero
        categoria,
        descripcion,
        nombre,
        precio: parseFloat(precio),  // Convertir a número flotante
        proveedor,
        idProducto: lastId,  // Asignar el ID auto-incremental
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
