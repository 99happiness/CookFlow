import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Recipe, RecipeCollection } from '../types/recipe';
import { getCollectionById } from '../storage/recipeStorage';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type RecipeDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RecipeDetail'>;
  route: RouteProp<RootStackParamList, 'RecipeDetail'>;
};

export default function RecipeDetailScreen({
  navigation,
  route,
}: RecipeDetailScreenProps) {
  const { collectionId, recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [collection, setCollection] = useState<RecipeCollection | null>(null);

  useEffect(() => {
    loadRecipe();
  }, [collectionId, recipeId]);

  const loadRecipe = async () => {
    const col = await getCollectionById(collectionId);
    if (col) {
      setCollection(col);
      const r = col.recipes.find((r) => r.id === recipeId);
      if (r) setRecipe(r);
    }
  };

  const handleStartCooking = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (recipe && collection) {
      navigation.navigate('CookingGuide', {
        collectionId: collection.id,
        recipeId: recipe.id,
      });
    }
  };

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const iconEmojis = ['🍳', '🥘', '🍲', '🥗', '🍜', '🍝', '🥩', '🍖'];
  const emoji = iconEmojis[recipe.name.length % iconEmojis.length];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          {/* Cover Image Area */}
          <LinearGradient
            colors={['#F2CC8F', '#E07A5F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverGradient}
          >
            <Text style={styles.coverEmoji}>{emoji}</Text>
          </LinearGradient>

          {/* Recipe Name */}
          <View style={styles.nameSection}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            {recipe.estimatedTime != null && (
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>
                  ⏱ {recipe.estimatedTime}分钟
                </Text>
              </View>
            )}
          </View>

          {/* Ingredients Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🥬</Text>
              <Text style={styles.sectionTitle}>你需要准备</Text>
            </View>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ing, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Steps Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👨‍🍳</Text>
              <Text style={styles.sectionTitle}>跟着做</Text>
            </View>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.order}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepDescription}>
                    {step.description}
                  </Text>
                  {step.duration != null && step.duration > 0 && (
                    <View style={styles.stepDuration}>
                      <Text style={styles.stepDurationText}>
                        ⏱ {step.duration >= 60
                          ? `${Math.floor(step.duration / 60)}分${step.duration % 60 > 0 ? `${step.duration % 60}秒` : ''}`
                          : `${step.duration}秒`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Completion Photo */}
          {recipe.completionPhoto && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📸</Text>
                <Text style={styles.sectionTitle}>我的成品</Text>
              </View>
              <Image
                source={{ uri: recipe.completionPhoto }}
                style={styles.completionPhoto}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Cooking Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cookButton}
          onPress={handleStartCooking}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cookButtonGradient}
          >
            <Text style={styles.cookButtonIcon}>🔥</Text>
            <Text style={styles.cookButtonText}>开始烹饪</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Fonts.body,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.card,
  },
  coverGradient: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 72,
  },
  nameSection: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeName: {
    ...Fonts.titleLarge,
    flex: 1,
  },
  timeBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  timeBadgeText: {
    ...Fonts.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    ...Fonts.titleSmall,
  },
  ingredientsList: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  ingredientName: {
    ...Fonts.body,
    flex: 1,
  },
  ingredientAmount: {
    ...Fonts.body,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    ...Fonts.body,
    lineHeight: 24,
  },
  stepDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    backgroundColor: '#FEF0EB',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  stepDurationText: {
    fontSize: 13,
    color: Colors.primary,
  },
  completionPhoto: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
  },
  cookButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.button,
  },
  cookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
  },
  cookButtonIcon: {
    fontSize: 22,
    marginRight: Spacing.sm,
  },
  cookButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
});
