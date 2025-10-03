import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text, 
  Alert, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const ModificarProducto = ({ route, navigation }) => {
  const { productoId } = route.params;
  const [producto, setProducto] = useState(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos de categorías y proveedores
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const [categoriasSnapshot, proveedoresSnapshot, productoDoc] = await Promise.all([
          getDocs(collection(db, "Categoria")),
          getDocs(collection(db, "Proveedor")),
          getDoc(doc(db, "Productos", productoId))
        ]);

        const categoriasData = categoriasSnapshot.docs.map(doc => doc.data().nombre);
        const proveedoresData = proveedoresSnapshot.docs.map(doc => doc.data().nombre);

        setCategorias(categoriasData);
        setProveedores(proveedoresData);

        if (productoDoc.exists()) {
          const data = productoDoc.data();
          setProducto(data);
          setNombre(data.nombre);
          setCategoria(data.categoria);
          setProveedor(data.proveedor);
          setDescripcion(data.descripcion);
          setPrecio(data.precio.toString());
        } else {
          Alert.alert("❌ Error", "Producto no encontrado");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error al cargar datos: ", error);
        Alert.alert("❌ Error", "Hubo un error al cargar los datos.");
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [productoId]);

  const modificarProducto = async () => {
    if (!nombre.trim() || !categoria || !proveedor || !descripcion.trim() || !precio) {
      Alert.alert("❌ Error", "Por favor, completa todos los campos");
      return;
    }

    if (isNaN(precio) || parseFloat(precio) <= 0) {
      Alert.alert("❌ Error", "El precio debe ser un número mayor a cero");
      return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(db, "Productos", productoId);
      await updateDoc(docRef, {
        nombre: nombre.trim(),
        categoria,
        proveedor,
        descripcion: descripcion.trim(),
        precio: parseFloat(precio),
      });

      Alert.alert(
        "✅ Éxito", 
        "Producto modificado exitosamente",
        [{ text: "Aceptar", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error("Error modificando producto: ", e);
      Alert.alert("❌ Error", "Hubo un error al modificar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Editar Producto</Text>
        <Text style={styles.subtitle}>ID: {productoId}</Text>
      </View>

      {/* Formulario */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Información del Producto</Text>

        {/* Nombre del Producto */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Producto *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el nombre del producto"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Categoría */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoria}
              onValueChange={(itemValue) => setCategoria(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona una categoría" value="" />
              {categorias.map((cat, index) => (
                <Picker.Item key={index} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Proveedor */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Proveedor *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={proveedor}
              onValueChange={(itemValue) => setProveedor(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un proveedor" value="" />
              {proveedores.map((prov, index) => (
                <Picker.Item key={index} label={prov} value={prov} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Precio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Precio *</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="0.00"
              value={precio}
              onChangeText={setPrecio}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe las características del producto..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Botones de Acción */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.saveButton,
              (!nombre || !categoria || !proveedor || !descripcion || !precio) && styles.saveButtonDisabled
            ]}
            onPress={modificarProducto}
            disabled={isSaving || !nombre || !categoria || !proveedor || !descripcion || !precio}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>💾 Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Información Actual */}
      {producto && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 Información Actual</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Stock actual:</Text>
            <Text style={styles.infoValue}>{producto.cantidadStock} unidades</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Última modificación:</Text>
            <Text style={styles.infoValue}>Ahora</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 60,
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
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
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
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  pickerContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceInput: {
    paddingLeft: 35,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  saveButtonText: {
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
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
});

export default ModificarProducto;