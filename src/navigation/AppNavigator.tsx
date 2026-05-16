import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors, Fonts } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import InputScreen from '../screens/InputScreen';
import RecipeCollectionScreen from '../screens/RecipeCollectionScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import CookingGuideScreen from '../screens/CookingGuideScreen';
import CompletionScreen from '../screens/CompletionScreen';

export type RootStackParamList = {
  Home: undefined;
  Input: undefined;
  RecipeCollection: { collectionId: string };
  RecipeDetail: { collectionId: string; recipeId: string };
  CookingGuide: { collectionId: string; recipeId: string };
  Completion: { collectionId: string; recipeId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            ...Fonts.titleSmall,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Input"
          component={InputScreen}
          options={{
            title: '',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="RecipeCollection"
          component={RecipeCollectionScreen}
          options={{
            title: '食谱集合',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetailScreen}
          options={{
            title: '食谱详情',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="CookingGuide"
          component={CookingGuideScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Completion"
          component={CompletionScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
