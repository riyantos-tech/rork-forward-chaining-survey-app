import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Survey, SurveyLogic } from '@/types';

export const [SurveyProvider, useSurvey] = createContextHook(() => {
  const logicQuery = useQuery({
    queryKey: ['surveyLogic'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('surveyLogic');
      if (!stored) {
        const defaultLogic: SurveyLogic = {
          premises: [],
          rules: [],
          subgoals: [],
        };
        await AsyncStorage.setItem('surveyLogic', JSON.stringify(defaultLogic));
        return defaultLogic;
      }
      return JSON.parse(stored) as SurveyLogic;
    },
  });

  const surveysQuery = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('surveys');
      return stored ? JSON.parse(stored) : [];
    },
  });

  const updateLogicMutation = useMutation({
    mutationFn: async (logic: SurveyLogic) => {
      await AsyncStorage.setItem('surveyLogic', JSON.stringify(logic));
      return logic;
    },
    onSuccess: () => {
      logicQuery.refetch();
    },
  });

  const submitSurveyMutation = useMutation({
    mutationFn: async ({ userId, responses }: { userId: string; responses: Record<string, any> }) => {
      const logic = logicQuery.data!;
      const result = evaluateForwardChaining(responses, logic);
      
      const questions = logic.premises.map(premise => ({
        id: premise.id,
        question: premise.question,
        answer: responses[premise.id]
      }));
      
      const survey: Survey = {
        id: `survey-${Date.now()}`,
        userId,
        responses,
        questions,
        result,
        timestamp: Date.now(),
      };

      const surveys = surveysQuery.data || [];
      const updated = [...surveys, survey];
      await AsyncStorage.setItem('surveys', JSON.stringify(updated));
      
      return survey;
    },
    onSuccess: () => {
      surveysQuery.refetch();
    },
  });

  const evaluateForwardChaining = (responses: Record<string, any>, logic: SurveyLogic): string => {
    const matchedSubgoals: string[] = [];

    for (const rule of logic.rules) {
      let allConditionsMet = true;

      for (const condition of rule.conditions) {
        const premise = logic.premises.find(p => p.id === condition.premiseId);
        if (!premise) continue;

        const responseValue = responses[premise.id];
        
        switch (condition.operator) {
          case '==':
            if (responseValue !== condition.value) allConditionsMet = false;
            break;
          case '!=':
            if (responseValue === condition.value) allConditionsMet = false;
            break;
          case '>':
            if (!(Number(responseValue) > Number(condition.value))) allConditionsMet = false;
            break;
          case '<':
            if (!(Number(responseValue) < Number(condition.value))) allConditionsMet = false;
            break;
          case '>=':
            if (!(Number(responseValue) >= Number(condition.value))) allConditionsMet = false;
            break;
          case '<=':
            if (!(Number(responseValue) <= Number(condition.value))) allConditionsMet = false;
            break;
        }

        if (!allConditionsMet) break;
      }

      if (allConditionsMet) {
        const subgoal = logic.subgoals.find(s => s.id === rule.subgoalId);
        if (subgoal) {
          matchedSubgoals.push(subgoal.name);
        }
      }
    }

    return matchedSubgoals.length > 0 
      ? matchedSubgoals.join(', ') 
      : 'Tidak ada hasil yang sesuai';
  };

  return {
    logic: logicQuery.data,
    surveys: surveysQuery.data || [],
    updateLogic: updateLogicMutation.mutateAsync,
    submitSurvey: submitSurveyMutation.mutateAsync,
    isSubmitting: submitSurveyMutation.isPending,
    refetchSurveys: surveysQuery.refetch,
  };
});
