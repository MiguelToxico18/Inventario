import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';  // Importar la configuración de Firebase
import { doc, getDoc, updateDoc } from 'firebase/firestore';  // Importar funciones de Firestore

const ModificarCategoria = ({ route, navigation }) => {
  const { categoriaId, categoriaNombre } = route.params;  // Obtener los parámetros de navegación
  const [categoriaEdicion, setCategoriaEdicion] = useState(categoriaNombre);  // Establecer el nombre de la categoría a modificar

  // Función para modificar la categoría en la base de datos
  const modificarCategoria = async () => {
    if (categoriaEdicion.trim() === "") {
      Alert.alert("Error", "El nombre de la categoría no puede estar vacío.");
      return;
    }

    try {
      const docRef = doc(db, "Categoria", categoriaId);
      await updateDoc(docRef, {
        nombre: categoriaEdicion,
      });

      Alert.alert("Éxito", "Categoría modificada exitosamente.");
      navigation.goBack();  // Volver a la pantalla anterior después de la modificación
    } catch (e) {
      console.error("Error modificando categoría: ", e);
      Alert.alert("Error", "Hubo un error al modificar la categoría. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={categoriaEdicion}
        onChangeText={setCategoriaEdicion}
        placeholder="Nuevo nombre de la categoría"
      />
      <Button title="Modificar" onPress={modificarCategoria} />
      <Button title="Cancelar" onPress={() => navigation.goBack()} />
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

export default ModificarCategoria;
