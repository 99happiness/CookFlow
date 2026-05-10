export interface Ingredient {
  name: string;
  amount: string;
}

export interface CookingStep {
  order: number;
  description: string;
  duration?: number; // seconds
}

export interface Recipe {
  id: string;
  name: string;
  coverImage?: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  estimatedTime?: number; // minutes
  completionPhoto?: string;
  createdAt: number;
}

export interface RecipeCollection {
  id: string;
  title: string;
  coverImage?: string;
  sourceUrl?: string;
  recipes: Recipe[];
  createdAt: number;
}
