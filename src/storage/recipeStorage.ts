import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeCollection } from '../types/recipe';

const COLLECTIONS_KEY = '@cookflow_collections';

export async function saveCollection(collection: RecipeCollection): Promise<void> {
  const existing = await getAllCollections();
  const index = existing.findIndex((c) => c.id === collection.id);
  if (index >= 0) {
    existing[index] = collection;
  } else {
    existing.unshift(collection);
  }
  await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(existing));
}

export async function getAllCollections(): Promise<RecipeCollection[]> {
  const data = await AsyncStorage.getItem(COLLECTIONS_KEY);
  if (!data) return [];
  return JSON.parse(data) as RecipeCollection[];
}

export async function getCollectionById(id: string): Promise<RecipeCollection | null> {
  const collections = await getAllCollections();
  return collections.find((c) => c.id === id) ?? null;
}

export async function deleteCollection(id: string): Promise<void> {
  const collections = await getAllCollections();
  const filtered = collections.filter((c) => c.id !== id);
  await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(filtered));
}

export async function updateRecipePhoto(
  collectionId: string,
  recipeId: string,
  photoUri: string,
): Promise<void> {
  const collections = await getAllCollections();
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection) return;
  const recipe = collection.recipes.find((r) => r.id === recipeId);
  if (!recipe) return;
  recipe.completionPhoto = photoUri;
  await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}
