import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Modal } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const ModificarProveedor = ({ route, navigation }) => {
  const { proveedorId, proveedorNombre } = route.params;  // Recibimos los datos del proveedor
  const [nuevoNombre, setNuevoNombre] = useState(proveedorNombre);

  const modificarProveedor = async () => {
    if (nuevoNombre.trim() === "") {
      alert("Por favor ingresa un nombre válido");
      return;
    }

    try {
      const docRef = doc(db, "Proveedor", proveedorId);
      await updateDoc(docRef, {
        nombre: nuevoNombre,
      });

      Alert.alert("Éxito", "Proveedor modificado exitosamente.");
      navigation.goBack();  // Volver a la pantalla anterior
    } catch (e) {
      console.error("Error modificando proveedor: ", e);
      Alert.alert("Error", "Hubo un error al modificar el proveedor. Intenta de nuevo.");
    }
  };

  return (
    <Modal
      visible={true}
      onRequestClose={() => navigation.goBack()}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <TextInput
          style={styles.input}
          value={nuevoNombre}
          onChangeText={setNuevoNombre}
          placeholder="Nuevo nombre del proveedor"
        />
        <Button title="Modificar" onPress={modificarProveedor} />
        <Button title="Cancelar" onPress={() => navigation.goBack()} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#282f75ff',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default ModificarProveedor;
