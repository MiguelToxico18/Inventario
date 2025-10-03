import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, setDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const AgregarMovimiento = () => {
  const [tipo, setTipo] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [nota, setNota] = useState('');
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Cargar productos desde Firestore
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosSnapshot = await getDocs(collection(db, "Productos"));
        const productosData = productosSnapshot.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().nombre,
          stock: doc.data().cantidadStock
        }));
        setProductos(productosData);
      } catch (error) {
        console.error("Error al cargar productos: ", error);
        Alert.alert("❌ Error", "Hubo un problema cargando los productos.");
      }
    };

    cargarProductos();
  }, []);

  // Actualizar producto seleccionado cuando cambia el picker
  useEffect(() => {
    if (productoId) {
      const producto = productos.find(p => p.id === productoId);
      setProductoSeleccionado(producto);
    } else {
      setProductoSeleccionado(null);
    }
  }, [productoId, productos]);

  // Obtener el siguiente ID de movimiento
  const obtenerSiguienteId = async () => {
    try {
      const docRef = doc(db, "Contadores", "movimientos");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const siguienteId = data.movimiento + 1;
        await updateDoc(docRef, { movimiento: siguienteId });
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

  // Validar si la salida es posible
  const validarSalida = (stockActual, cantidadSalida) => {
    return stockActual >= cantidadSalida;
  };

  // Función para agregar el movimiento a Firestore
  const agregarMovimiento = async () => {
    if (!tipo || !productoId || !cantidad || !nota) {
      Alert.alert("❌ Error", "Por favor, llena todos los campos.");
      return;
    }

    if (isNaN(cantidad) || parseInt(cantidad) <= 0) {
      Alert.alert("❌ Error", "La cantidad debe ser un número mayor a cero.");
      return;
    }

    const cantidadNum = parseInt(cantidad);

    // Validar stock para salidas
    if (tipo === 'salida' && productoSeleccionado) {
      if (!validarSalida(productoSeleccionado.stock, cantidadNum)) {
        Alert.alert(
          "❌ Stock Insuficiente",
          `No hay suficiente stock disponible.\nStock actual: ${productoSeleccionado.stock}\nIntenta retirar: ${cantidadNum}`
        );
        return;
      }
    }

    const fecha = Timestamp.now();

    try {
      const siguienteId = await obtenerSiguienteId();

      // Registrar el movimiento
      const docRef = doc(db, "Movimientos", siguienteId);
      await setDoc(docRef, {
        cantidad: cantidadNum,
        fecha,
        nota,
        productoId,
        tipo,
      });

      // Actualizar stock del producto
      const productoRef = doc(db, "Productos", productoId);
      const productoSnapshot = await getDoc(productoRef);
      if (productoSnapshot.exists()) {
        const productoData = productoSnapshot.data();
        let nuevoStock = productoData.cantidadStock;

        if (tipo === 'entrada') {
          nuevoStock += cantidadNum;
        } else if (tipo === 'salida') {
          nuevoStock -= cantidadNum;
        }

        await updateDoc(productoRef, {
          cantidadStock: nuevoStock,
        });
      }

      Alert.alert(
        "✅ Movimiento Registrado",
        `Movimiento de ${tipo} registrado correctamente.\nID: ${siguienteId}`
      );
      
      // Limpiar formulario
      setTipo('');
      setProductoId('');
      setCantidad('');
      setNota('');
      setProductoSeleccionado(null);
      
    } catch (error) {
      console.error("Error agregando movimiento: ", error);
      Alert.alert("❌ Error", "Hubo un error al registrar el movimiento.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Registrar Movimiento</Text>
        <Text style={styles.subtitle}>Gestiona entradas y salidas de inventario</Text>
      </View>

      {/* Formulario */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Información del Movimiento</Text>

        {/* Tipo de Movimiento */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de Movimiento *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipo}
              onValueChange={(itemValue) => setTipo(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona tipo de movimiento" value="" />
              <Picker.Item label="📥 Entrada de Stock" value="entrada" />
              <Picker.Item label="📤 Salida de Stock" value="salida" />
            </Picker>
          </View>
        </View>

        {/* Producto */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Producto *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productoId}
              onValueChange={(itemValue) => setProductoId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un producto" value="" />
              {productos.map((producto) => (
                <Picker.Item 
                  key={producto.id} 
                  label={`${producto.nombre} (Stock: ${producto.stock})`} 
                  value={producto.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Información del producto seleccionado */}
        {productoSeleccionado && (
          <View style={styles.productoInfo}>
            <Text style={styles.productoInfoTitle}>Información del Producto:</Text>
            <View style={styles.productoDetails}>
              <Text style={styles.productoDetail}>Nombre: {productoSeleccionado.nombre}</Text>
              <Text style={styles.productoDetail}>Stock actual: {productoSeleccionado.stock}</Text>
              {tipo === 'salida' && (
                <Text style={[
                  styles.stockAlert,
                  productoSeleccionado.stock < 10 ? styles.stockBajo : styles.stockNormal
                ]}>
                  {productoSeleccionado.stock < 10 ? '⚠️ Stock bajo' : '✅ Stock suficiente'}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Cantidad */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cantidad *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa la cantidad"
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="numeric"
          />
          {tipo === 'salida' && productoSeleccionado && cantidad && (
            <Text style={[
              styles.validacionText,
              validarSalida(productoSeleccionado.stock, parseInt(cantidad)) 
                ? styles.validacionSuccess 
                : styles.validacionError
            ]}>
              {validarSalida(productoSeleccionado.stock, parseInt(cantidad))
                ? `✅ Stock suficiente (Quedarían ${productoSeleccionado.stock - parseInt(cantidad)} unidades)`
                : `❌ Stock insuficiente (Faltan ${parseInt(cantidad) - productoSeleccionado.stock} unidades)`
              }
            </Text>
          )}
        </View>

        {/* Nota */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Motivo / Nota *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Compra a proveedor, Venta a cliente, Ajuste de inventario..."
            value={nota}
            onChangeText={setNota}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Botón de registro */}
        <TouchableOpacity 
          style={[
            styles.primaryButton,
            (!tipo || !productoId || !cantidad || !nota) && styles.buttonDisabled
          ]} 
          onPress={agregarMovimiento}
          disabled={!tipo || !productoId || !cantidad || !nota}
        >
          <Text style={styles.primaryButtonText}>
            📋 Registrar Movimiento
          </Text>
        </TouchableOpacity>
      </View>

      {/* Información de ayuda */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Información Importante</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            <Text style={styles.entradaText}>Entradas:</Text> Aumentan el stock del producto
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            <Text style={styles.salidaText}>Salidas:</Text> Disminuyen el stock del producto
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            Las salidas no pueden exceder el stock disponible
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2d3748',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  productoInfo: {
    backgroundColor: '#edf2f7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4299e1',
  },
  productoInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  productoDetails: {
    marginLeft: 8,
  },
  productoDetail: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 4,
  },
  stockAlert: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  stockBajo: {
    color: '#e53e3e',
  },
  stockNormal: {
    color: '#38a169',
  },
  validacionText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  validacionSuccess: {
    color: '#38a169',
  },
  validacionError: {
    color: '#e53e3e',
  },
  primaryButton: {
    backgroundColor: '#4299e1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    shadowColor: '#a0aec0',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoBullet: {
    color: '#4299e1',
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#4a5568',
    flex: 1,
  },
  entradaText: {
    color: '#38a169',
    fontWeight: '600',
  },
  salidaText: {
    color: '#e53e3e',
    fontWeight: '600',
  },
});

export default AgregarMovimiento;