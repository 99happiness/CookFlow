import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RecipeCollection } from '../types/recipe';
import { getCollectionById } from '../storage/recipeStorage';
import RecipeCard from '../components/RecipeCard';
import { Colors, Fonts, Spacing, BorderRadius } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type RecipeCollectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RecipeCollection'>;
  route: RouteProp<RootStackParamList, 'RecipeCollection'>;
};

export default function RecipeCollectionScreen({
  navigation,
  route,
}: RecipeCollectionScreenProps) {
  const { collectionId } = route.params;
  const [collection, setCollection] = useState<RecipeCollection | null>(null);

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    const data = await getCollectionById(collectionId);
    setCollection(data);
  };

  if (!collection) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={collection.recipes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <LinearGradient
              colors={['#F2CC8F', '#E07A5F', '#81B29A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coverGradient}
            >
              <Text style={styles.coverEmoji}>🍽️</Text>
              <Text style={styles.coverTitle}>{collection.title}</Text>
              <Text style={styles.coverSubtitle}>
                共 {collection.recipes.length} 道食谱
              </Text>
            </LinearGradient>
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() =>
              navigation.navigate('RecipeDetail', {
                collectionId: collection.id,
                recipeId: item.id,
              })
            }
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    marginBottom: Spacing.md,
  },
  coverGradient: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  coverEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  coverTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  coverSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  list: {
    paddingBottom: Spacing.xxl,
  },
});
