import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { authService } from '../src/services/authService';
import { palette, spacing, radius, shadow } from '../constants/theme';

export default function AuthScreen() {
  const [isStudent, setIsStudent] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    grade: '',
    subject: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !formData.name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!isLogin && isStudent && !formData.grade) {
      Alert.alert('Error', 'Please select your grade');
      return;
    }

    if (!isLogin && !isStudent && !formData.subject) {
      Alert.alert('Error', 'Please enter your subject');
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (isLogin) {
        // Login
        if (isStudent) {
          response = await authService.studentLogin({
            email: formData.email,
            password: formData.password,
          });
        } else {
          response = await authService.teacherLogin({
            email: formData.email,
            password: formData.password,
          });
        }
      } else {
        // Signup
        if (isStudent) {
          response = await authService.studentSignup({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            grade: parseInt(formData.grade),
          });
        } else {
          response = await authService.teacherSignup({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            subject: formData.subject,
          });
        }
      }

      await login(response);
      Alert.alert('Success', response.message, [
        {
          text: 'OK',
          onPress: () => {
            if (response.type === 'student') {
              router.replace('/(tabs)');
            } else {
              router.replace('/teachers/mathProgress');
            }
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      grade: '',
      subject: '',
    });
  };

  return (
    <LinearGradient
      colors={[palette.primary, palette.backgroundBottom]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🎓 Gamified Learning</Text>
          <Text style={styles.subtitle}>
            {isStudent ? 'Student' : 'Teacher'} {isLogin ? 'Login' : 'Sign Up'}
          </Text>
        </View>

        {/* User Type Selection */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, isStudent && styles.typeButtonActive]}
            onPress={() => {
              setIsStudent(true);
              resetForm();
            }}
          >
            <Text style={[styles.typeButtonText, isStudent && styles.typeButtonTextActive]}>
              👨‍🎓 Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, !isStudent && styles.typeButtonActive]}
            onPress={() => {
              setIsStudent(false);
              resetForm();
            }}
          >
            <Text style={[styles.typeButtonText, !isStudent && styles.typeButtonTextActive]}>
              👨‍🏫 Teacher
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, isLogin && styles.modeButtonActive]}
            onPress={() => {
              setIsLogin(true);
              resetForm();
            }}
          >
            <Text style={[styles.modeButtonText, isLogin && styles.modeButtonTextActive]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, !isLogin && styles.modeButtonActive]}
            onPress={() => {
              setIsLogin(false);
              resetForm();
            }}
          >
            <Text style={[styles.modeButtonText, !isLogin && styles.modeButtonTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={palette.muted}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={palette.muted}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={palette.muted}
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />

          {!isLogin && isStudent && (
            <View style={styles.gradeSelector}>
              <Text style={styles.label}>Select Grade:</Text>
              <View style={styles.gradeButtons}>
                {[9, 10].map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeButton,
                      formData.grade === grade.toString() && styles.gradeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, grade: grade.toString() })}
                  >
                    <Text
                      style={[
                        styles.gradeButtonText,
                        formData.grade === grade.toString() && styles.gradeButtonTextActive,
                      ]}
                    >
                      Grade {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {!isLogin && !isStudent && (
            <TextInput
              style={styles.input}
              placeholder="Subject (e.g., Mathematics, Science)"
              placeholderTextColor={palette.muted}
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
            />
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: palette.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 18,
    color: palette.white,
    opacity: 0.9,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.xs,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  typeButtonActive: {
    backgroundColor: palette.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textDark,
  },
  typeButtonTextActive: {
    color: palette.white,
  },
  modeToggle: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  modeButtonActive: {
    backgroundColor: palette.backgroundBottom,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textDark,
  },
  modeButtonTextActive: {
    color: palette.white,
  },
  form: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.muted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    color: palette.textDark,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textDark,
    marginBottom: spacing.sm,
  },
  gradeSelector: {
    marginBottom: spacing.md,
  },
  gradeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: palette.muted,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  gradeButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  gradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textDark,
  },
  gradeButtonTextActive: {
    color: palette.white,
  },
  submitButton: {
    backgroundColor: palette.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: palette.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
