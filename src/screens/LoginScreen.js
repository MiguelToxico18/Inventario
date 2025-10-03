import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  Linking,
  ActivityIndicator 
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("❌ Error", "Por favor, completa todos los campos");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("❌ Error", "Por favor, ingresa un correo electrónico válido");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("✅ Éxito", "Inicio de sesión correcto");
      navigation.replace("Home");
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico es inválido";
          break;
        case 'auth/user-not-found':
          errorMessage = "No existe una cuenta con este correo";
          break;
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión. Verifica tu internet";
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert("❌ Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContactAdmin = async () => {
    // Intentar abrir TikTok app primero
    const tiktokAppURL = "tiktok://@skillyull";
    const tiktokWebURL = "https://www.tiktok.com/@skillyull";
    
    try {
      // Intentar abrir la app de TikTok
      const canOpen = await Linking.canOpenURL(tiktokAppURL);
      if (canOpen) {
        await Linking.openURL(tiktokAppURL);
      } else {
        // Si no tiene la app, abrir en navegador web
        await Linking.openURL(tiktokWebURL);
      }
    } catch (error) {
      console.log("Error abriendo TikTok:", error);
      Alert.alert(
        "❌ No se pudo abrir TikTok",
        "Puedes buscar @skillyull manualmente en TikTok",
        [
          { 
            text: "Copiar usuario", 
            onPress: () => {
              // Aquí podrías copiar el usuario al clipboard si quisieras
              Alert.alert("✅", "Usuario: @skillyull");
            }
          },
          { 
            text: "Abrir en navegador", 
            onPress: () => Linking.openURL(tiktokWebURL) 
          },
          { 
            text: "Cancelar", 
            style: "cancel" 
          }
        ]
      );
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "🔒 ¿Olvidaste tu contraseña?",
      "Por favor, contacta al administrador del sistema para restablecer tu contraseña.",
      [
        { 
          text: "Contactar por TikTok", 
          onPress: handleContactAdmin 
        },
        { 
          text: "Cancelar", 
          style: "cancel" 
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: 'https://raw.githubusercontent.com/Quispee/flayer/yuler/skill.jpg',
              }}
              style={styles.logo}
              resizeMode="cover"
              onError={() => console.log("Error cargando imagen")}
            />
          </View>
          <Text style={styles.title}>InventarioSkill</Text>
          <Text style={styles.subtitle}>Sistema de Gestión de Inventarios</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              placeholder="ejemplo@empresa.com"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Ingresa tu contraseña"
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholderTextColor="#9ca3af"
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Olvidé Contraseña */}
          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón de Login */}
          <TouchableOpacity 
            style={[
              styles.loginButton,
              (isLoading || !email || !password) && styles.loginButtonDisabled
            ]} 
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Información de la App */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>
              Versión 1.0.0
            </Text>
            <Text style={styles.appInfoSubtext}>
              Sistema de gestión de inventarios
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Problemas para acceder?{" "}
            <Text style={styles.contactText} onPress={handleContactAdmin}>
              Contacta al administrador
            </Text>
          </Text>
          <Text style={styles.tiktokHandle}>@skillyull</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#ffffff",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#3b82f6",
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "400",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  eyeButtonText: {
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowColor: "#9ca3af",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  appInfo: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  appInfoText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  appInfoSubtext: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  contactText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  tiktokHandle: {
    fontSize: 14,
    color: "#ff0050",
    fontWeight: "600",
  },
});