import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Recipe } from '../types/recipe';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../theme';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export default function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const iconEmojis = ['🍳', '🥘', '🍲', '🥗', '🍜', '🍝', '🥩', '🍖'];
  const randomEmoji = iconEmojis[recipe.name.length % iconEmojis.length];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#F2CC8F', '#E07A5F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imageContainer}
      >
        <Text style={styles.emoji}>{randomEmoji}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {recipe.name}
        </Text>
        <View style={styles.meta}>
          {recipe.estimatedTime != null && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱</Text>
              <Text style={styles.metaText}>{recipe.estimatedTime}分钟</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🥬</Text>
            <Text style={styles.metaText}>{recipe.ingredients.length}种食材</Text>
          </View>
        </View>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    ...Fonts.titleSmall,
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  metaText: {
    ...Fonts.caption,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textLight,
    fontWeight: '300',
  },
});
