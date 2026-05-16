import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { v4 as uuidv4 } from 'uuid';
import { parseRecipesFromText, parseRecipesFromUrl } from '../services/aiService';
import { saveCollection } from '../storage/recipeStorage';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type InputScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Input'>;
};

type InputMode = 'text' | 'link';

export default function InputScreen({ navigation }: InputScreenProps) {
  const [mode, setMode] = useState<InputMode>('text');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const isDouyinLink = (text: string) => {
    return (
      text.includes('douyin.com') ||
      text.includes('v.douyin') ||
      text.includes('tiktok.com')
    );
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      Alert.alert('提示', '请输入食谱文本或链接');
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (mode === 'link' || isDouyinLink(trimmed)) {
        const result = await parseRecipesFromUrl(trimmed);
        const collection = {
          id: uuidv4(),
          title: result.title,
          sourceUrl: trimmed,
          recipes: result.recipes,
          createdAt: Date.now(),
        };
        await saveCollection(collection);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (collection.recipes.length === 1) {
          navigation.replace('RecipeDetail', {
            collectionId: collection.id,
            recipeId: collection.recipes[0].id,
          });
        } else {
          navigation.replace('RecipeCollection', {
            collectionId: collection.id,
          });
        }
      } else {
        const recipes = await parseRecipesFromText(trimmed);
        const collection = {
          id: uuidv4(),
          title:
            recipes.length > 1
              ? `${recipes.length}道美味食谱`
              : recipes[0]?.name || '我的食谱',
          recipes,
          createdAt: Date.now(),
        };
        await saveCollection(collection);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (collection.recipes.length === 1) {
          navigation.replace('RecipeDetail', {
            collectionId: collection.id,
            recipeId: collection.recipes[0].id,
          });
        } else {
          navigation.replace('RecipeCollection', {
            collectionId: collection.id,
          });
        }
      }
    } catch {
      Alert.alert('解析失败', '无法解析食谱，请检查输入内容后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>添加食谱</Text>
          <Text style={styles.subtitle}>
            粘贴食谱文本或抖音链接，AI 将自动识别
          </Text>

          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'text' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('text')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>📝</Text>
              <Text
                style={[
                  styles.modeLabel,
                  mode === 'text' && styles.modeLabelActive,
                ]}
              >
                文本识别
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'link' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('link')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>🔗</Text>
              <Text
                style={[
                  styles.modeLabel,
                  mode === 'link' && styles.modeLabelActive,
                ]}
              >
                链接识别
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                mode === 'link' && styles.linkInput,
              ]}
              placeholder={
                mode === 'text'
                  ? '在这里粘贴食谱文本...\n\n例如：\n番茄炒蛋\n食材：番茄2个，鸡蛋3个...\n步骤：1. 番茄切块...'
                  : '粘贴抖音视频链接...\n\n例如：\nhttps://v.douyin.com/xxxxx'
              }
              placeholderTextColor={Colors.textLight}
              value={input}
              onChangeText={setInput}
              multiline={mode === 'text'}
              numberOfLines={mode === 'text' ? 8 : 2}
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!input.trim() || loading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.submitIcon}>✨</Text>
                <Text style={styles.submitText}>AI 智能识别</Text>
              </>
            )}
          </TouchableOpacity>

          {loading && (
            <Text style={styles.loadingText}>
              正在解析食谱，请稍候...
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    ...Fonts.titleLarge,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Fonts.bodySmall,
    marginBottom: Spacing.lg,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FEF0EB',
  },
  modeIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  modeLabel: {
    ...Fonts.body,
    color: Colors.textSecondary,
  },
  modeLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 200,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  linkInput: {
    minHeight: 80,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.button,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  submitText: {
    ...Fonts.titleSmall,
    color: Colors.white,
  },
  loadingText: {
    ...Fonts.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
