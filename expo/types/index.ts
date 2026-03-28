export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface Survey {
  id: string;
  userId: string;
  responses: Record<string, any>;
  questions: { id: string; question: string; answer: any }[];
  result: string;
  timestamp: number;
}

export interface Premise {
  id: string;
  name: string;
  question: string;
  type: 'boolean' | 'text' | 'number';
}

export interface Rule {
  id: string;
  name: string;
  conditions: {
    premiseId: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: any;
  }[];
  subgoalId: string;
}

export interface Subgoal {
  id: string;
  name: string;
  description: string;
}

export interface SurveyLogic {
  premises: Premise[];
  rules: Rule[];
  subgoals: Subgoal[];
}
