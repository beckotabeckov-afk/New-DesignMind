
export interface ChoiceSummary {
  stepTitle: string;
  label: string;
  image?: string;
}

export interface QuizAnswer {
  id: string;
  label: string;
  image?: string;
  description?: string;
  nextStepId?: string;
}

export interface QuizStep {
  id: string;
  title: string;
  question: string;
  options: QuizAnswer[];
  isMulti?: boolean;
  isText?: boolean; // Для ввода названия объекта
  nextStepId?: string;
}

export interface QuizProject {
  id: string;
  name: string;
  createdAt: number;
  steps: QuizStep[];
}

export interface UserSelections {
  [key: string]: string | string[];
}

export interface DesignResult {
  technicalAssignment: string;
  moodboardDescription: string;
  moodboardImageUrl?: string;      // 1. Коллаж материалов (общий)
  interiorVisualUrl?: string;     // 2. Визуализация интерьера
  bathroomVisualUrl?: string;     // 3. Визуализация сан узла
  bathroomMoodboardUrl?: string;  // 4. Коллаж материалов (сан узел)
  choices: ChoiceSummary[];
}
