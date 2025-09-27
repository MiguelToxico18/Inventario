import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { db } from '../firebaseConfig';  // Importar la configuración de Firebase
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';  // Importar Firestore

const AgregarProveedor = () => {
  const [proveedor, setProveedor] = useState('');  // Estado para manejar el nombre del proveedor
  const [mensaje, setMensaje] = useState('');  // Estado para manejar el mensaje de éxito
  const [lastId, setLastId] = useState('prov000');  // Estado para manejar el último ID registrado

  // Función para obtener el último ID registrado
  const obtenerUltimoId = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Proveedor"));
      let maxId = 0;

      // Recorremos los documentos y extraemos la parte numérica del ID
      querySnapshot.forEach(doc => {
        const id = doc.id.replace('prov', '');  // Obtener solo la parte numérica del ID (sin "prov")
        const numId = parseInt(id); // Convertir la parte numérica a un número
        if (!isNaN(numId)) {
          maxId = Math.max(maxId, numId);  // Obtener el ID más alto si es un número válido
        }
      });

      setLastId(`prov${String(maxId + 1).padStart(3, '0')}`);  // Incrementar el ID y asignarlo a lastId
    } catch (e) {
      console.error("Error obteniendo el último ID: ", e);
      setLastId('prov001');  // Si no hay IDs en Firestore, comenzamos desde prov001
    }
  };

  // Cargar el último ID cuando el componente se monta
  useEffect(() => {
    obtenerUltimoId();  // Obtener el último ID cuando se monta el componente
  }, []);

  // Función para agregar el proveedor a Firestore
  const agregarProveedor = async () => {
    if (proveedor.trim() === "") {
      alert("Por favor ingresa un nombre de proveedor");
      return; // Si el campo está vacío, no hace nada
    }

    try {
      // Usamos setDoc para asignar un ID manual con el formato prov001, prov002, etc.
      const docRef = doc(db, "Proveedor", lastId); // Usamos el lastId como el ID del documento
      await setDoc(docRef, {
        nombre: proveedor,  // El valor del input (lo que el usuario ingresa)
        idProveedor: lastId,  // Asignar el ID auto-incremental
      });

      // Actualiza el mensaje de éxito en la interfaz
      setMensaje(`Proveedor "${proveedor}" agregado con ID ${lastId}.`);
      Alert.alert("Éxito", `Proveedor "${proveedor}" agregado exitosamente con ID ${lastId}`);  // Alerta de éxito
      setProveedor('');  // Limpiar el campo de texto después de agregar el proveedor
      obtenerUltimoId();  // Actualizar el último ID después de agregar el proveedor
    } catch (e) {
      console.error("Error agregando proveedor: ", e);  // Manejar cualquier error
      Alert.alert("Error", "Hubo un error al agregar el proveedor. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre del proveedor"
        value={proveedor}
        onChangeText={setProveedor}  // Actualiza el estado con el valor del input
      />
      <Button title="Agregar Proveedor" onPress={agregarProveedor} />
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

export default AgregarProveedor;
