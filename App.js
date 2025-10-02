import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar las pantallas
import AgregarCategoria from './src/screens/AgregarCategoria';
import AgregarProveedor from './src/screens/AgregarProveedor';
import AgregarProducto from './src/screens/AgregarProducto';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from "./src/screens/LoginScreen";
import MovimientosScreen from './src/screens/AgregarMovimiento';
import ModificarProducto from './src/screens/ModificarProducto';  
import VerMovimientos from './src/screens/VerMovimientos';  
import ModificarCategoria from './src/screens/ModificarCategoria';  
import ModificarProveedor from './src/screens/ModificarProveedor';


const Stack = createStackNavigator();  // Crear el stack de navegación

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Iniciar Sesión', headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Pantalla de Inicio' }} 
        />
        <Stack.Screen 
          name="AgregarCategoria" 
          component={AgregarCategoria} 
          options={{ title: 'Agregar Categoría' }} 
        />
        <Stack.Screen 
          name="AgregarProveedor"  
          component={AgregarProveedor} 
          options={{ title: 'Agregar Proveedor' }} 
        />
        <Stack.Screen 
          name="AgregarProducto"  
          component={AgregarProducto} 
          options={{ title: 'Agregar Producto' }} 
        />
        <Stack.Screen 
          name="Movimientos" 
          component={MovimientosScreen} 
          options={{ title: 'Movimientos' }} 
        />
        <Stack.Screen 
          name="ModificarProducto" 
          component={ModificarProducto} 
          options={{ title: 'Modificar Producto' }} 
        />
        <Stack.Screen
          name="VerMovimientos"
          component={VerMovimientos}
          options={{ title: 'Movimientos' }}
        />
        <Stack.Screen
          name="ModificarCategoria"  // Agregar pantalla de modificación
          component={ModificarCategoria}
          options={{ title: 'Modificar Categoría' }}
        />
        <Stack.Screen
          name="ModificarProveedor"  // Agregar la pantalla de modificar proveedor
          component={ModificarProveedor} 
          options={{ title: 'Modificar Proveedor' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
