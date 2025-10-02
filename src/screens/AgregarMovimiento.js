import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native'; 
import { db } from '../firebaseConfig'; 
import { collection, getDocs, setDoc, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore'; 
import { Timestamp } from 'firebase/firestore'; 
import { Picker } from '@react-native-picker/picker'; // Correcto import de Picker

const AgregarMovimiento = () => {
  const [tipo, setTipo] = useState('');  // Entrada o salida
  const [productoId, setProductoId] = useState('');  // ID del producto
  const [cantidad, setCantidad] = useState('');  // Cantidad de movimiento
  const [nota, setNota] = useState('');  // Nota del movimiento
  const [productos, setProductos] = useState([]);  // Lista de productos para seleccionar

  // Cargar productos desde Firestore
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosSnapshot = await getDocs(collection(db, "Productos"));
        const productosData = productosSnapshot.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre
        }));
        setProductos(productosData);  // Guardar productos en el estado
      } catch (error) {
        console.error("Error al cargar productos: ", error);
      }
    };

    cargarProductos();
  }, []);

  // Obtener el siguiente ID de movimiento de la colección Contadores
  const obtenerSiguienteId = async () => {
    try {
      const docRef = doc(db, "Contadores", "movimientos");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const siguienteId = data.movimiento + 1;

        await updateDoc(docRef, {
          movimiento: siguienteId
        });

        return `mov${String(siguienteId).padStart(3, '0')}`;  
      } else {
        await setDoc(docRef, { movimiento: 1 });
        return "mov001";  
      }
    } catch (error) {
      console.error("Error al obtener el siguiente ID: ", error);
      return "mov001";  
    }
  };

  // Función para agregar el movimiento a Firestore
  const agregarMovimiento = async () => {
    if (!tipo || !productoId || !cantidad || !nota) {
      Alert.alert("Error", "Por favor, llena todos los campos.");
      return;
    }

    if (isNaN(cantidad)) {
      Alert.alert("Error", "La cantidad debe ser un número.");
      return;
    }

    const fecha = Timestamp.now();

    try {
      const siguienteId = await obtenerSiguienteId();

      const docRef = doc(db, "Movimientos", siguienteId); 
      await setDoc(docRef, {
        cantidad: parseInt(cantidad),
        fecha,
        nota,
        productoId,
        tipo,
      });

      const productoRef = doc(db, "Productos", productoId);
      const productoSnapshot = await getDoc(productoRef);
      if (productoSnapshot.exists()) {
        const productoData = productoSnapshot.data();
        let nuevoStock = productoData.cantidadStock;

        if (tipo === 'entrada') {
          nuevoStock += parseInt(cantidad);
        } else if (tipo === 'salida') {
          nuevoStock -= parseInt(cantidad);
        }

        await updateDoc(productoRef, {
          cantidadStock: nuevoStock,
        });
      }

      Alert.alert("Éxito", "Movimiento registrado correctamente.");
      setTipo('');
      setProductoId('');
      setCantidad('');
      setNota('');
    } catch (error) {
      console.error("Error agregando movimiento: ", error);
      Alert.alert("Error", "Hubo un error al registrar el movimiento.");
    }
  };

  // Función para eliminar un movimiento y ajustar el stock
  const eliminarMovimiento = async (movimientoId) => {
    try {
      const movimientoRef = doc(db, "Movimientos", movimientoId);
      const movimientoSnapshot = await getDoc(movimientoRef);

      if (movimientoSnapshot.exists()) {
        const movimientoData = movimientoSnapshot.data();
        const { tipo, cantidad, productoId } = movimientoData;

        // Obtener el producto al que se le va a ajustar el stock
        const productoRef = doc(db, "Productos", productoId);
        const productoSnapshot = await getDoc(productoRef);

        if (productoSnapshot.exists()) {
          const productoData = productoSnapshot.data();
          let nuevoStock = productoData.cantidadStock;

          // Ajustar el stock según el tipo de movimiento
          if (tipo === 'salida') {
            nuevoStock += cantidad;  // Aumentar el stock porque estamos eliminando una salida
          } else if (tipo === 'entrada') {
            nuevoStock -= cantidad; // Restar el stock porque estamos eliminando una entrada
          }

          // Verificación del stock después del ajuste
          console.log('Stock actualizado:', nuevoStock);

          // Actualizar el stock del producto
          await updateDoc(productoRef, {
            cantidadStock: nuevoStock,
          });

          // Finalmente, eliminamos el movimiento de la colección Movimientos
          await deleteDoc(movimientoRef);

          Alert.alert("Éxito", "Movimiento eliminado y stock ajustado correctamente.");
        } else {
          Alert.alert("Error", "Producto no encontrado.");
        }
      } else {
        Alert.alert("Error", "Movimiento no encontrado.");
      }
    } catch (error) {
      console.error("Error al eliminar el movimiento: ", error);
      Alert.alert("Error", "Hubo un problema al eliminar el movimiento.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Movimiento</Text>

      <Text>Tipo de Movimiento:</Text>
      <Picker selectedValue={tipo} onValueChange={(itemValue) => setTipo(itemValue)}>
        <Picker.Item label="Selecciona tipo de movimiento" value="" />
        <Picker.Item label="Entrada" value="entrada" />
        <Picker.Item label="Salida" value="salida" />
      </Picker>

      <Text>Selecciona Producto:</Text>
      <Picker selectedValue={productoId} onValueChange={(itemValue) => setProductoId(itemValue)}>
        <Picker.Item label="Selecciona un producto" value="" />
        {productos.map((producto) => (
          <Picker.Item key={producto.id} label={producto.nombre} value={producto.id} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Cantidad"
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Nota (motivo)"
        value={nota}
        onChangeText={setNota}
      />

      <Button title="Registrar Movimiento" onPress={agregarMovimiento} />

      {/* Aquí puedes agregar un botón para eliminar movimiento si tienes una lista de movimientos */}
      {/* Ejemplo de cómo eliminar un movimiento */}
      {/* <Button title="Eliminar Movimiento" onPress={() => eliminarMovimiento(movimientoId)} /> */}
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
    fontSize: 24,
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

export default AgregarMovimiento;
