import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { db } from '../firebaseConfig';  // Importar la configuración de Firebase
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';  // Importar Firestore

const AgregarCategoria = () => {
  const [categoria, setCategoria] = useState('');  // Estado para manejar el nombre de la categoría
  const [mensaje, setMensaje] = useState('');  // Estado para manejar el mensaje de éxito
  const [lastId, setLastId] = useState('CAT000');  // Estado para manejar el último ID registrado

  // Función para obtener el último ID registrado
  const obtenerUltimoId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categoria"));
      let maxId = 0;

      // Recorremos los documentos y extraemos la parte numérica del ID
      querySnapshot.forEach(doc => {
        const id = doc.id.replace('CAT', '');  // Obtener solo la parte numérica del ID (sin "CAT")
        const numId = parseInt(id); // Convertir la parte numérica a un número
        if (!isNaN(numId)) {
          maxId = Math.max(maxId, numId);  // Obtener el ID más alto si es un número válido
        }
      });

      setLastId(`CAT${String(maxId + 1).padStart(3, '0')}`);  // Incrementar el ID y asignarlo a lastId
    } catch (e) {
      console.error("Error obteniendo el último ID: ", e);
      setLastId('CAT001');  // Si no hay IDs en Firestore, comenzamos desde CAT001
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
      // Usamos setDoc para asignar un ID manual con el formato CAT001, CAT002, etc.
      const docRef = doc(db, "Categoria", lastId); // Usamos el lastId como el ID del documento
      await setDoc(docRef, {
        nombre: categoria,  // El valor del input (lo que el usuario ingresa)
        idCategoria: lastId,  // Asignar el ID auto-incremental
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
      {mensaje ? <Text style={styles.successMessage}>{mensaje}</Text> : null}  {/* Muestra el mensaje de éxito si existe */}
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
