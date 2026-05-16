import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { updateRecipePhoto } from '../storage/recipeStorage';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type CompletionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Completion'>;
  route: RouteProp<RootStackParamList, 'Completion'>;
};

// Confetti particle component
function ConfettiParticle({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const colors = ['#E07A5F', '#F2CC8F', '#81B29A', '#3D405B', '#F4F1DE'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;

  useEffect(() => {
    const startAnimation = () => {
      translateY.setValue(-50);
      translateX.setValue(0);
      rotate.setValue(0);
      opacity.setValue(1);
      scale.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 600,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: (Math.random() - 0.5) * 200,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: Math.random() * 4 - 2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(1500),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    };

    startAnimation();
  }, [delay, translateY, translateX, rotate, opacity, scale]);

  const rotateStr = rotate.interpolate({
    inputRange: [-2, 2],
    outputRange: ['-360deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: 0,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        opacity,
        transform: [
          { translateY },
          { translateX },
          { rotate: rotateStr },
          { scale },
        ],
      }}
    />
  );
}

export default function CompletionScreen({
  navigation,
  route,
}: CompletionScreenProps) {
  const { collectionId, recipeId } = route.params;
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const titleScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(50)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(titleScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(buttonsTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [titleScale, titleOpacity, buttonsTranslateY, buttonsOpacity]);

  const handleTakePhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      // Try picking from library instead
      const libResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!libResult.canceled && libResult.assets[0]) {
        const uri = libResult.assets[0].uri;
        setPhotoUri(uri);
        await updateRecipePhoto(collectionId, recipeId, uri);
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      await updateRecipePhoto(collectionId, recipeId, uri);
    }
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.popToTop();
  };

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 800,
    startX: Math.random() * 400,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Confetti */}
      <View style={styles.confettiContainer}>
        {confettiParticles.map((p) => (
          <ConfettiParticle key={p.id} delay={p.delay} startX={p.startX} />
        ))}
      </View>

      {/* Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: titleOpacity,
            transform: [{ scale: titleScale }],
          },
        ]}
      >
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>完成烹饪！</Text>
        <Text style={styles.subtitle}>
          太棒了，又一道美味佳肴诞生了
        </Text>
      </Animated.View>

      {/* Photo Preview */}
      {photoUri && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.photo}
            resizeMode="cover"
          />
          <Text style={styles.photoLabel}>📸 我的成品照</Text>
        </View>
      )}

      {/* Buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            opacity: buttonsOpacity,
            transform: [{ translateY: buttonsTranslateY }],
          },
        ]}
      >
        {!photoUri && (
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.photoButtonIcon}>📷</Text>
            <Text style={styles.photoButtonText}>拍摄成品照</Text>
          </TouchableOpacity>
        )}

        {photoUri && (
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.retakeButtonText}>重新拍照</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>回到首页</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cookingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.cookingText,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  photoLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  buttonsContainer: {
    width: '80%',
    gap: Spacing.md,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cookingAccent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.button,
  },
  photoButtonIcon: {
    fontSize: 22,
    marginRight: Spacing.sm,
  },
  photoButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  retakeButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  retakeButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'underline',
  },
  finishButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.cookingText,
  },
});
