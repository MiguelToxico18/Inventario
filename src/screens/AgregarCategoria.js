import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { db } from '../firebaseConfig';  // Importar la configuración de Firebase
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';  // Importar Firestore

const AgregarCategoria = () => {
  const [categoria, setCategoria] = useState('');  // Estado para manejar el nombre de la categoría
  const [mensaje, setMensaje] = useState('');  // Estado para manejar el mensaje de éxito
  const [lastId, setLastId] = useState('cat000');  // Estado para manejar el último ID registrado

  // Función para obtener el último ID registrado
  const obtenerUltimoId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categoria"));
      let maxId = 0;
      querySnapshot.forEach(doc => {
        const id = doc.id.replace('cat', '');  // Obtener solo la parte numérica del ID (sin "cat")
        maxId = Math.max(maxId, parseInt(id));  // Obtener el ID más alto
      });
      setLastId(`cat${String(maxId + 1).padStart(3, '0')}`);  // Incrementar el ID y asignarlo a lastId
    } catch (e) {
      console.error("Error obteniendo el último ID: ", e);
      setLastId('cat001');  // Si no hay IDs en Firestore, comenzamos desde cat001
    }
  };

  // Cargar el último ID cuando el componente se monta
  useEffect(() => {
    obtenerUltimoId();  // Obtener el último ID cuando se monta el componente
  }, []);

  // Función para agregar la categoría a Firestore
  const agregarCategoria = async () => {
    if (categoria.trim() === "") {
      alert("Por favor ingresa un nombre de categoría");
      return; // Si el campo está vacío, no hace nada
    }

    try {
      // Agregar la nueva categoría a Firestore con el ID generado
      await setDoc(doc(db, "Categoria", lastId), {
        nombre: categoria,  // El valor del input (lo que el usuario ingresa)
      });

      // Actualiza el mensaje de éxito en la interfaz
      setMensaje(`Categoría "${categoria}" agregada con ID ${lastId}.`);
      Alert.alert("Éxito", `Categoría "${categoria}" agregada exitosamente con ID ${lastId}`);  // Alerta de éxito
      setCategoria('');  // Limpiar el campo de texto después de agregar la categoría
      obtenerUltimoId();  // Actualizar el último ID después de agregar la categoría
    } catch (e) {
      console.error("Error agregando categoría: ", e);  // Manejar cualquier error
      Alert.alert("Error", "Hubo un error al agregar la categoría. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre de la categoría"
        value={categoria}
        onChangeText={setCategoria}  // Actualiza el estado con el valor del input
      />
      <Button title="Agregar Categoría" onPress={agregarCategoria} />
      {mensaje ? <Text style={styles.successMessage}>{mensaje}{/* Muestra el mensaje de éxito si existe */}</Text> : null}  
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
  successMessage: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
});

export default AgregarCategoria;
