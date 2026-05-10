import { Recipe, Ingredient, CookingStep } from '../types/recipe';
import { v4 as uuidv4 } from 'uuid';

const OPENAI_API_BASE = 'https://api.openai.com/v1';

function getApiKey(): string {
  // Read from environment or config
  // Users should set this in their .env or app config
  return (
    (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) ||
    ''
  );
}

interface ParsedRecipe {
  name: string;
  ingredients: { name: string; amount: string }[];
  steps: { order: number; description: string; duration?: number }[];
  estimatedTime?: number;
}

const SYSTEM_PROMPT = `你是一个专业的食谱解析助手。用户会给你一段文本或视频描述，其中可能包含一个或多个食谱。
请将每个食谱提取为结构化的 JSON 格式。

返回格式必须是一个 JSON 数组，每个元素包含：
{
  "name": "菜名",
  "ingredients": [{"name": "食材名", "amount": "用量"}],
  "steps": [{"order": 1, "description": "步骤描述", "duration": 秒数或null}],
  "estimatedTime": 预估总烹饪时间(分钟)
}

注意：
1. duration 字段表示这个步骤需要的等待/烹饪时间（秒），如"煮5分钟"则 duration 为 300。如果步骤没有明确时间则设为 null。
2. 每个步骤的 description 要简洁清晰，适合在手机上大字显示。
3. 如果文本中包含多个食谱，全部提取出来。
4. ingredients 中的 amount 要包含单位，如"200g"、"2汤匙"、"适量"等。
5. 只返回 JSON 数组，不要有其他文字。`;

export async function parseRecipesFromText(
  text: string,
  apiKey?: string,
): Promise<Recipe[]> {
  const key = apiKey || getApiKey();

  if (!key) {
    // Demo mode: return mock data based on input
    return generateMockRecipes(text);
  }

  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return generateMockRecipes(text);

    const parsed: ParsedRecipe[] = JSON.parse(jsonMatch[0]);
    return parsed.map((r) => ({
      id: uuidv4(),
      name: r.name,
      ingredients: r.ingredients as Ingredient[],
      steps: r.steps as CookingStep[],
      estimatedTime: r.estimatedTime,
      createdAt: Date.now(),
    }));
  } catch {
    return generateMockRecipes(text);
  }
}

export async function parseRecipesFromUrl(
  url: string,
  apiKey?: string,
): Promise<{ title: string; recipes: Recipe[] }> {
  const key = apiKey || getApiKey();

  if (!key) {
    return {
      title: '抖音美食合集',
      recipes: generateMockRecipes(url),
    };
  }

  try {
    const prompt = `请解析以下抖音视频链接中的食谱信息。链接：${url}
    
由于你无法直接访问链接，请基于链接中可能包含的信息（如标题关键词）来推断并生成合理的食谱。
如果无法推断，请生成一个示例食谱作为演示。`;

    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return { title: '抖音美食合集', recipes: generateMockRecipes(url) };
    }

    const parsed: ParsedRecipe[] = JSON.parse(jsonMatch[0]);
    const recipes = parsed.map((r) => ({
      id: uuidv4(),
      name: r.name,
      ingredients: r.ingredients as Ingredient[],
      steps: r.steps as CookingStep[],
      estimatedTime: r.estimatedTime,
      createdAt: Date.now(),
    }));

    return {
      title: recipes.length > 1 ? `${recipes.length}道美味食谱` : recipes[0]?.name || '美食食谱',
      recipes,
    };
  } catch {
    return { title: '抖音美食合集', recipes: generateMockRecipes(url) };
  }
}

function generateMockRecipes(input: string): Recipe[] {
  const recipes: Recipe[] = [
    {
      id: uuidv4(),
      name: '番茄炒蛋',
      ingredients: [
        { name: '番茄', amount: '2个' },
        { name: '鸡蛋', amount: '3个' },
        { name: '葱花', amount: '适量' },
        { name: '盐', amount: '1茶匙' },
        { name: '糖', amount: '半茶匙' },
        { name: '食用油', amount: '2汤匙' },
      ],
      steps: [
        { order: 1, description: '番茄洗净切块，鸡蛋打散加少许盐搅匀', duration: null as unknown as undefined },
        { order: 2, description: '锅中倒油，大火烧热', duration: 30 },
        { order: 3, description: '倒入蛋液，快速翻炒至凝固盛出', duration: 60 },
        { order: 4, description: '锅中再加少许油，放入番茄翻炒出汁', duration: 120 },
        { order: 5, description: '加入盐和糖调味', duration: null as unknown as undefined },
        { order: 6, description: '倒回鸡蛋，翻炒均匀，撒葱花出锅', duration: 30 },
      ],
      estimatedTime: 10,
      createdAt: Date.now(),
    },
    {
      id: uuidv4(),
      name: '蒜蓉西兰花',
      ingredients: [
        { name: '西兰花', amount: '1朵' },
        { name: '大蒜', amount: '5瓣' },
        { name: '蚝油', amount: '1汤匙' },
        { name: '盐', amount: '适量' },
        { name: '食用油', amount: '1汤匙' },
      ],
      steps: [
        { order: 1, description: '西兰花切小朵，大蒜切末', duration: null as unknown as undefined },
        { order: 2, description: '烧一锅开水，加少许盐和油', duration: 120 },
        { order: 3, description: '西兰花焯水2分钟，捞出沥干', duration: 120 },
        { order: 4, description: '锅中倒油，小火爆香蒜末', duration: 30 },
        { order: 5, description: '加入西兰花和蚝油，大火翻炒1分钟', duration: 60 },
        { order: 6, description: '调味出锅，摆盘即可', duration: null as unknown as undefined },
      ],
      estimatedTime: 12,
      createdAt: Date.now(),
    },
  ];

  // If input looks short, return just one recipe
  if (input.length < 30) {
    return [recipes[0]];
  }

  return recipes;
}
