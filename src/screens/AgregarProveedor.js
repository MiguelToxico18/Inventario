import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, FlatList, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';  // Importar useNavigation para la navegación

const AgregarProveedor = () => {
  const navigation = useNavigation();  // Usar useNavigation para la navegación
  const [proveedor, setProveedor] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [proveedorId, setProveedorId] = useState('');
  const [proveedorNombre, setProveedorNombre] = useState('');

  // Función para obtener el último ID y generar un nuevo ID único
  const obtenerUltimoId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Proveedor"));
      let maxId = 0;

      querySnapshot.forEach(doc => {
        const id = doc.id.replace('prov', '');  // Obtener solo la parte numérica del ID
        const numId = parseInt(id);
        if (!isNaN(numId)) {
          maxId = Math.max(maxId, numId);  // Obtener el ID más alto si es un número válido
        }
      });

      return `prov${String(maxId + 1).padStart(3, '0')}`;  // Incrementar el ID
    } catch (e) {
      console.error("Error obteniendo el último ID: ", e);
      return 'prov001';  // Si no hay IDs en Firestore, comenzamos desde prov001
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
      setProveedores(proveedoresData);  // Actualizamos la lista de proveedores
    } catch (e) {
      console.error("Error obteniendo los proveedores: ", e);
    }
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const agregarProveedor = async () => {
    if (proveedor.trim() === "") {
      alert("Por favor ingresa un nombre de proveedor");
      return;
    }

    try {
      const nuevoId = await obtenerUltimoId();  // Obtenemos un nuevo ID único

      const docRef = doc(db, "Proveedor", nuevoId);
      await setDoc(docRef, {
        nombre: proveedor,
        idProveedor: nuevoId,
      });

      setMensaje(`Proveedor "${proveedor}" agregado con ID ${nuevoId}.`);
      Alert.alert("Éxito", `Proveedor "${proveedor}" agregado exitosamente con ID ${nuevoId}`);
      setProveedor('');  // Limpiar el input
      obtenerProveedores();  // Recargar los proveedores
    } catch (e) {
      console.error("Error agregando proveedor: ", e);
      Alert.alert("Error", "Hubo un error al agregar el proveedor. Intenta de nuevo.");
    }
  };

  const eliminarProveedor = async (idProveedor) => {
    try {
      await deleteDoc(doc(db, "Proveedor", idProveedor));
      Alert.alert("Éxito", "Proveedor eliminado exitosamente.");
      obtenerProveedores();
    } catch (e) {
      console.error("Error eliminando proveedor: ", e);
      Alert.alert("Error", "Hubo un error al eliminar el proveedor. Intenta de nuevo.");
    }
  };

  const abrirModal = (id, nombre) => {
    setProveedorId(id);  // Establecemos el ID del proveedor
    setProveedorNombre(nombre);  // Establecemos el nombre del proveedor
    setModalVisible(true);  // Hacemos visible el modal

    // Navegar a la pantalla de modificación
    navigation.navigate('ModificarProveedor', {
      proveedorId: id,
      proveedorNombre: nombre,
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre del proveedor"
        value={proveedor}
        onChangeText={setProveedor}
      />
      <Button title="Agregar Proveedor" onPress={agregarProveedor} />
      {mensaje ? <Text style={styles.successMessage}>{mensaje}</Text> : null}

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>ID</Text>
        <Text style={styles.headerText}>Nombre</Text>
        <Text style={styles.headerText}>Acciones</Text>
      </View>

      <ScrollView horizontal={true} style={styles.scrollContainer}>
        <FlatList
          data={proveedores}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <View style={styles.categoryRow}>
                <Text style={styles.itemText}>{item.id}</Text>
                <Text style={styles.itemText}>{item.nombre}</Text>
                <View style={styles.actions}>
                  <Button title="Modificar" onPress={() => abrirModal(item.id, item.nombre)} />
                  <Button title="Eliminar" onPress={() => eliminarProveedor(item.id)} />
                </View>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 100,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  successMessage: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'column',
    marginLeft: 10,
    justifyContent: 'center',
    width: 100,
  },
  scrollContainer: {
    marginTop: 10,
  },
  itemText: {
    width: 100,
    textAlign: 'center',
  },
});

export default AgregarProveedor;
