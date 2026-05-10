import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Recipe, CookingStep } from '../types/recipe';
import { getCollectionById } from '../storage/recipeStorage';
import TimerRing from '../components/TimerRing';
import { Colors, Fonts, Spacing, BorderRadius } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type CookingGuideScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CookingGuide'>;
  route: RouteProp<RootStackParamList, 'CookingGuide'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CookingGuideScreen({
  navigation,
  route,
}: CookingGuideScreenProps) {
  const { collectionId, recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerTotal, setTimerTotal] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecipe();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      Speech.stop();
    };
  }, []);

  const loadRecipe = async () => {
    const col = await getCollectionById(collectionId);
    if (col) {
      const r = col.recipes.find((r) => r.id === recipeId);
      if (r) {
        setRecipe(r);
        speakStep(r.steps[0]);
        startTimerForStep(r.steps[0]);
      }
    }
  };

  const speakStep = (step: CookingStep) => {
    Speech.stop();
    Speech.speak(step.description, {
      language: 'zh-CN',
      rate: 0.9,
      pitch: 1.0,
    });
  };

  const startTimerForStep = (step: CookingStep) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (step.duration && step.duration > 0) {
      setTimerTotal(step.duration);
      setTimerRemaining(step.duration);
      setIsTimerActive(true);
      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsTimerActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimerTotal(0);
      setTimerRemaining(0);
      setIsTimerActive(false);
    }
  };

  const animateTransition = useCallback(
    (direction: 'left' | 'right', callback: () => void) => {
      const toValue = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        callback();
        slideAnim.setValue(direction === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim],
  );

  const goToNextStep = useCallback(() => {
    if (!recipe) return;
    if (currentStepIndex >= recipe.steps.length - 1) {
      // All steps completed
      navigation.replace('Completion', { collectionId, recipeId });
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition('left', () => {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      speakStep(recipe.steps[nextIndex]);
      startTimerForStep(recipe.steps[nextIndex]);
    });
  }, [recipe, currentStepIndex, collectionId, recipeId, navigation, animateTransition]);

  const goToPrevStep = useCallback(() => {
    if (!recipe || currentStepIndex <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition('right', () => {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      speakStep(recipe.steps[prevIndex]);
      startTimerForStep(recipe.steps[prevIndex]);
    });
  }, [recipe, currentStepIndex, animateTransition]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          goToNextStep();
        } else if (gestureState.dx > 50) {
          goToPrevStep();
        }
      },
    }),
  ).current;

  if (!recipe) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const currentStep = recipe.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / recipe.steps.length) * 100;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="light" />

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        <Text style={styles.stepCounter}>
          {currentStepIndex + 1}/{recipe.steps.length}
        </Text>
      </View>

      {/* Step Content */}
      <Animated.View
        style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.stepNumberBadge}>
          <Text style={styles.stepNumberText}>
            步骤 {currentStep.order}
          </Text>
        </View>

        <Text style={styles.stepDescription}>
          {currentStep.description}
        </Text>

        {/* Timer */}
        {isTimerActive && timerTotal > 0 && (
          <View style={styles.timerContainer}>
            <TimerRing
              remaining={timerRemaining}
              total={timerTotal}
              size={180}
              strokeWidth={6}
            />
          </View>
        )}

        {!isTimerActive && timerTotal > 0 && timerRemaining === 0 && (
          <View style={styles.timerDone}>
            <Text style={styles.timerDoneText}>⏰ 时间到！</Text>
          </View>
        )}
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentStepIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={goToPrevStep}
          disabled={currentStepIndex === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>‹ 上一步</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.speakButton}
          onPress={() => speakStep(currentStep)}
          activeOpacity={0.7}
        >
          <Text style={styles.speakButtonText}>🔊</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={goToNextStep}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>
            {currentStepIndex === recipe.steps.length - 1
              ? '完成 ✓'
              : '下一步 ›'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipe Hint */}
      <Text style={styles.swipeHint}>← 左右滑动切换步骤 →</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cookingBg,
    paddingTop: 50,
  },
  loadingText: {
    color: Colors.cookingText,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.cookingRingBg,
    marginHorizontal: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.cookingRing,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: Colors.cookingText,
    fontSize: 18,
  },
  recipeName: {
    ...Fonts.body,
    color: 'rgba(255,255,255,0.6)',
  },
  stepCounter: {
    ...Fonts.body,
    color: Colors.cookingRing,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  stepNumberBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  stepNumberText: {
    color: Colors.cookingRing,
    fontSize: 14,
    fontWeight: '600',
  },
  stepDescription: {
    ...Fonts.cookingStep,
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: Spacing.xl,
  },
  timerContainer: {
    marginTop: Spacing.lg,
  },
  timerDone: {
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(129,178,154,0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  timerDoneText: {
    fontSize: 24,
    color: Colors.success,
    fontWeight: '600',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: Colors.cookingText,
    fontSize: 16,
    fontWeight: '600',
  },
  speakButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakButtonText: {
    fontSize: 24,
  },
  swipeHint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    paddingBottom: Spacing.xl,
  },
});
