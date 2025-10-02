import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, FlatList, ScrollView, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';  // Importar la configuración de Firebase
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';  // Importar Firestore

const AgregarCategoria = ({ navigation }) => {  // Recibiendo el prop navigation
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
      alert("Por favor ingresa un nombre de categoría");
      return;
    }

    try {
      const docRef = doc(db, "Categoria", lastId);
      await setDoc(docRef, {
        nombre: categoria,
        idCategoria: lastId,
      });

      setMensaje(`Categoría "${categoria}" agregada con ID ${lastId}.`);
      Alert.alert("Éxito", `Categoría "${categoria}" agregada exitosamente con ID ${lastId}`);
      setCategoria('');
      obtenerUltimoId();
      obtenerCategorias();
    } catch (e) {
      console.error("Error agregando categoría: ", e);
      Alert.alert("Error", "Hubo un error al agregar la categoría. Intenta de nuevo.");
    }
  };

  const eliminarCategoria = async (idCategoria) => {
    try {
      await deleteDoc(doc(db, "Categoria", idCategoria));
      Alert.alert("Éxito", "Categoría eliminada exitosamente.");
      obtenerCategorias();
    } catch (e) {
      console.error("Error eliminando categoría: ", e);
      Alert.alert("Error", "Hubo un error al eliminar la categoría. Intenta de nuevo.");
    }
  };

  const abrirModal = (id, nombre) => {
    // Pasamos el id y nombre de la categoría a la pantalla ModificarCategoria
    navigation.navigate('ModificarCategoria', { categoriaId: id, categoriaNombre: nombre });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre de la categoría"
        value={categoria}
        onChangeText={setCategoria}
      />
      <Button title="Agregar Categoría" onPress={agregarCategoria} />
      {mensaje ? <Text style={styles.successMessage}>{mensaje}</Text> : null}

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>ID</Text>
        <Text style={styles.headerText}>Nombre</Text>
        <Text style={styles.headerText}>Acciones</Text>
      </View>

      <ScrollView horizontal={true} style={styles.scrollContainer}>
        <FlatList
          data={categorias}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <View style={styles.categoryRow}>
                <Text style={styles.itemText}>{item.id}</Text>
                <Text style={styles.itemText}>{item.nombre}</Text>
                <View style={styles.actions}>
                  <Button title="Modificar" onPress={() => abrirModal(item.id, item.nombre)} />
                  <Button title="Eliminar" onPress={() => eliminarCategoria(item.id)} />
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
    width: 100,  // Ajuste del tamaño para las columnas
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
    flexDirection: 'column',  // Cambiar de fila a columna para apilar los botones
    marginLeft: 10,
    justifyContent: 'center',
    width: 100,  // Ancho ajustado para los botones
  },
  scrollContainer: {
    marginTop: 10,
  },
  itemText: {
    width: 100,  // Ajuste del tamaño para las celdas
    textAlign: 'center',
  },
});

export default AgregarCategoria;
