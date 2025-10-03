import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, setDoc, doc, onSnapshot } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const AgregarProducto = () => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidadStock, setCantidadStock] = useState('');
  const [precio, setPrecio] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [lastId, setLastId] = useState('prod000');
  const [productos, setProductos] = useState([]);

  // Cargar datos iniciales y suscribirse a cambios en tiempo real
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const categoriasSnapshot = await getDocs(collection(db, "Categoria"));
        const proveedoresSnapshot = await getDocs(collection(db, "Proveedor"));

        const categoriasData = categoriasSnapshot.docs.map(doc => doc.data().nombre);
        const proveedoresData = proveedoresSnapshot.docs.map(doc => doc.data().nombre);

        setCategorias(categoriasData);
        setProveedores(proveedoresData);
      } catch (error) {
        console.error("Error al cargar los datos: ", error);
        Alert.alert("Error", "Hubo un error al cargar los datos.");
      }
    };

    // Suscribirse a cambios en tiempo real de los productos
    const unsubscribe = onSnapshot(collection(db, "Productos"), (snapshot) => {
      const productosData = [];
      let maxId = 0;

      snapshot.forEach((doc) => {
        productosData.push({ id: doc.id, ...doc.data() });
        
        // Calcular el último ID
        const id = doc.id.replace('prod', '');
        const numId = parseInt(id);
        if (!isNaN(numId)) {
          maxId = Math.max(maxId, numId);
        }
      });

      setProductos(productosData);
      setLastId(`prod${String(maxId + 1).padStart(3, '0')}`);
    });

    cargarDatos();

    // Limpiar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  const agregarProducto = async () => {
    if (nombre.trim() === "" || categoria === "" || proveedor === "" || descripcion.trim() === "" || cantidadStock === "" || precio === "") {
      alert("Por favor, llena todos los campos");
      return;
    }

    if (isNaN(cantidadStock) || isNaN(precio)) {
      alert("La cantidad en stock y el precio deben ser valores numéricos");
      return;
    }

    try {
      const docRef = doc(db, "Productos", lastId);
      await setDoc(docRef, {
        cantidadStock: parseInt(cantidadStock),
        categoria,
        descripcion,
        nombre,
        precio: parseFloat(precio),
        proveedor,
        idProducto: lastId,
      });

      Alert.alert("Éxito", "Producto agregado exitosamente");
      
      // Limpiar formulario
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Agregar Nuevo Producto</Text>
        <Text style={styles.subtitle}>Complete la información del producto</Text>
      </View>

      {/* Formulario */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Información del Producto</Text>

        {/* Fila 1: Nombre y Categoría */}
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Producto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el nombre"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoria}
                onValueChange={(itemValue) => setCategoria(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Seleccionar categoría" value="" />
                {categorias.map((cat, index) => (
                  <Picker.Item key={index} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Fila 2: Precio y Stock */}
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio *</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.inputWithPadding]}
                placeholder="0.00"
                value={precio}
                onChangeText={setPrecio}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock *</Text>
            <TextInput
              style={styles.input}
              placeholder="Cantidad disponible"
              value={cantidadStock}
              onChangeText={setCantidadStock}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Fila 3: Proveedor */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Proveedor *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={proveedor}
              onValueChange={(itemValue) => setProveedor(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccionar proveedor" value="" />
              {proveedores.map((prov, index) => (
                <Picker.Item key={index} label={prov} value={prov} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción detallada del producto..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Botón de acción */}
        <TouchableOpacity style={styles.button} onPress={agregarProducto}>
          <Text style={styles.buttonText}>➕ Agregar Producto</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos existentes */}
      <View style={styles.productsCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inventario Actual</Text>
          <Text style={styles.productCount}>{productos.length} productos</Text>
        </View>

        {productos.length > 0 ? (
          productos.map((producto) => (
            <View key={producto.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{producto.nombre}</Text>
                <View style={[
                  styles.stockBadge,
                  producto.cantidadStock < 10 ? styles.lowStock : styles.normalStock
                ]}>
                  <Text style={styles.stockText}>
                    Stock: {producto.cantidadStock}
                  </Text>
                </View>
              </View>
              
              <View style={styles.productDetails}>
                <Text style={styles.productDetail}>Categoría: {producto.categoria}</Text>
                <Text style={styles.productDetail}>Precio: ${producto.precio}</Text>
                <Text style={styles.productDetail}>Proveedor: {producto.proveedor}</Text>
              </View>
              
              {producto.descripcion && (
                <Text style={styles.productDescription}>
                  {producto.descripcion}
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay productos registrados</Text>
            <Text style={styles.emptyStateSubtext}>
              Los productos agregados aparecerán aquí
            </Text>
          </View>
        )}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  inputWithPadding: {
    paddingLeft: 30,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  button: {
    backgroundColor: '#4299e1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  productsCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  productCount: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  productCard: {
    backgroundColor: '#f7fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4299e1',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
    marginRight: 12,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  normalStock: {
    backgroundColor: '#c6f6d5',
  },
  lowStock: {
    backgroundColor: '#fed7d7',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  productDetail: {
    fontSize: 12,
    color: '#718096',
    marginRight: 16,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#a0aec0',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#cbd5e0',
    textAlign: 'center',
  },
});

export default AgregarProducto;