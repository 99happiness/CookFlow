import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecipeCollection } from '../types/recipe';
import { getAllCollections, deleteCollection } from '../storage/recipeStorage';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [collections, setCollections] = useState<RecipeCollection[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollections = useCallback(async () => {
    const data = await getAllCollections();
    setCollections(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [loadCollections]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCollection(id);
    await loadCollections();
  };

  const handleCollectionPress = (collection: RecipeCollection) => {
    if (collection.recipes.length === 1) {
      navigation.navigate('RecipeDetail', {
        collectionId: collection.id,
        recipeId: collection.recipes[0].id,
      });
    } else {
      navigation.navigate('RecipeCollection', { collectionId: collection.id });
    }
  };

  const iconEmojis = ['🍳', '🥘', '🍲', '🥗', '🍜', '🍝', '🥩', '🍖'];

  const renderCollection = ({ item }: { item: RecipeCollection }) => {
    const emoji = iconEmojis[item.title.length % iconEmojis.length];
    const recipeCount = item.recipes.length;
    const date = new Date(item.createdAt);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    return (
      <TouchableOpacity
        style={styles.collectionCard}
        onPress={() => handleCollectionPress(item)}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.collectionIcon}>
          <Text style={styles.collectionEmoji}>{emoji}</Text>
        </View>
        <View style={styles.collectionContent}>
          <Text style={styles.collectionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.collectionMeta}>
            {recipeCount}道食谱 · {dateStr}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>你好，美食家 👋</Text>
        <Text style={styles.title}>CookFlow</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Input')}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonIcon}>+</Text>
        <View style={styles.addButtonContent}>
          <Text style={styles.addButtonTitle}>添加新食谱</Text>
          <Text style={styles.addButtonSubtitle}>
            粘贴文字或抖音链接，AI 自动识别
          </Text>
        </View>
      </TouchableOpacity>

      {collections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyTitle}>还没有食谱</Text>
          <Text style={styles.emptySubtitle}>
            点击上方按钮，开始你的美食之旅
          </Text>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={renderCollection}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    ...Fonts.bodySmall,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Fonts.titleLarge,
    fontSize: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addButtonIcon: {
    fontSize: 28,
    color: Colors.primary,
    fontWeight: '300',
    width: 44,
    height: 44,
    lineHeight: 44,
    textAlign: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  addButtonContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  addButtonTitle: {
    ...Fonts.titleSmall,
    color: Colors.primary,
  },
  addButtonSubtitle: {
    ...Fonts.caption,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionEmoji: {
    fontSize: 24,
  },
  collectionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  collectionTitle: {
    ...Fonts.titleSmall,
    marginBottom: 2,
  },
  collectionMeta: {
    ...Fonts.caption,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textLight,
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Fonts.titleMedium,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Fonts.bodySmall,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
});
