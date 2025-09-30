import React from 'react';
import { NavigationContainer } from '@react-navigation/native';  // Importar la navegación
import { createStackNavigator } from '@react-navigation/stack';  // Importar Stack Navigator

// Importa las pantallas
import AgregarCategoria from './src/screens/AgregarCategoria';  // Pantalla AgregarCategoria
import AgregarProveedor from './src/screens/AgregarProveedor';  // Pantalla AgregarProveedor
import AgregarProducto from './src/screens/AgregarProducto';  // Pantalla AgregarProducto
import HomeScreen from './src/screens/HomeScreen';  // Pantalla de inicio
import LoginScreen from "./src/screens/LoginScreen"; // Pantalla de inicio de sesión

const Stack = createStackNavigator();  // Crea el stack de navegación

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
          name="AgregarProveedor"  // El nombre aquí debe coincidir con el que usas para navegar
          component={AgregarProveedor} 
          options={{ title: 'Agregar Proveedor' }} 
        />
        <Stack.Screen 
          name="AgregarProducto"  // Agregar la pantalla para productos
          component={AgregarProducto} 
          options={{ title: 'Agregar Producto' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
