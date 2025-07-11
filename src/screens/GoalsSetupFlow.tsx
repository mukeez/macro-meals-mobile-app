import React, { useState, useEffect, useContext } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native'
import CustomSafeAreaView from 'src/components/CustomSafeAreaView'
import CustomPagerView from 'src/components/CustomPagerView'
import GoalsGender from 'src/components/goal_flow_components/basic_info/GoalsGender'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from 'src/types/navigation'
import { useGoalsFlowStore } from 'src/store/goalsFlowStore'
import useStore from 'src/store/useStore'
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants'
import BackButton from 'src/components/BackButton'
import { GoalsDateOfBirth } from 'src/components/goal_flow_components/basic_info/GoalsDateOfBirth'
import { LinearProgress } from 'src/components/LinearProgress'
// import { GoalsLocation } from 'src/components/goal_flow_components/basic_info/GoalsLocation'
import { GoalBodyMetrics } from 'src/components/goal_flow_components/basic_info/GoalsBodyMetrics'
import { GoalDailyActivityLevel } from 'src/components/goal_flow_components/basic_info/GoalsDailyActivityLevel'
import { GoalsDietryPreference } from 'src/components/goal_flow_components/basic_info/GoalsDietryPreference'
import { GoalsFitnessGoal } from 'src/components/goal_flow_components/your_goal/GoalsFitnessGoal'
import { GoalsTargetWeight } from 'src/components/goal_flow_components/your_goal/GoalsTargetWeight'
import { GoalsProgressRate } from 'src/components/goal_flow_components/your_goal/GoalsProgressRate'
import { GoalsPersonalizedPlan } from 'src/components/goal_flow_components/your_plan/GoalsPersonalizedPlan'
import { HasMacrosContext } from '../contexts/HasMacrosContext'

const API_URL = 'https://api.macromealsapp.com/api/v1';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GoalsSetupFlow'>;

export const GoalsSetupFlow =  () => {
  const navigation = useNavigation<NavigationProp>();
  const { 
    majorStep, 
    setMajorStep, 
    subSteps, 
    setSubStep, 
    completed, 
    markSubStepComplete, 
    gender, 
    dateOfBirth, 
    location, 
    unit, 
    heightFt, 
    heightIn, 
    heightCm, 
    weightLb, 
    weightKg, 
    dailyActivityLevel, 
    dietryPreference ,
    fitnessGoal,
    targetWeight,
    progressRate,
    preferences,
    setPreferences,
    macroTargets,
    setMacroTargets,
  } = useGoalsFlowStore();

  const [isLoading, setIsLoading] = React.useState(false);
  const [macroCalculationResponse, setMacroCalculationResponse] = React.useState<any>(null);
  const token = useStore((state) => state.token);
  const { setHasMacros, setReadyForDashboard } = useContext(HasMacrosContext);

  const majorSteps = ['Basic info', 'Your goal', 'Your plan'];
  const subStepCounts = [5, 3, 1];
  const isLastStepOfSecondMajor = majorStep === 2 && subSteps[majorStep] === subStepCounts[majorStep] - 1;

  React.useEffect(() => {
    if (isLastStepOfSecondMajor) {
      const fetchAndStorePreferences = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_URL}/preferences/get-preferences`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });
          const data = await response.json();
          setPreferences(data);
          // Map API response to macroTargets
          setMacroTargets({
            carbs: data.carbs_target,
            fat: data.fat_target,
            protein: data.protein_target,
            calorie: data.calorie_target,
          });
        } catch (error) {
          Alert.alert('Error', 'Failed to fetch your preferences');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAndStorePreferences();
      calculateMacros();
    }
  }, [isLastStepOfSecondMajor]);

  const calculateMacros = async () => {
    try {
      setIsLoading(true);
      try {
        // Validate required fields
        if (!dateOfBirth || !gender || !dailyActivityLevel || !dietryPreference || !fitnessGoal || !targetWeight || !progressRate) {
          throw new Error('Missing required fields');
        }

        // Calculate height (convert feet + inches to decimal feet for imperial)
        let heightValue = 0;
        if (unit === 'imperial') {
          if (heightFt === null || heightIn === null) {
            throw new Error('Missing height measurement');
          }
          heightValue = heightFt + (heightIn / 12); // Convert to decimal feet
        } else {
          if (heightCm === null) {
            throw new Error('Missing height measurement');
          }
          heightValue = heightCm;
        }

        // Calculate weight (do not convert, just pass as is)
        let weightValue = 0;
        if (unit === 'imperial') {
          if (weightLb === null) {
            throw new Error('Missing weight measurement');
          }
          weightValue = weightLb;
        } else {
          if (weightKg === null) {
            throw new Error('Missing weight measurement');
          }
          weightValue = weightKg;
        }

        // Map and format API fields
        const sexApi = gender?.toLowerCase(); // "male" or "female"
        const dobApi = (() => {
          if (dateOfBirth && dateOfBirth.includes('/')) {
            const [day, month, year] = dateOfBirth.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          return dateOfBirth;
        })();

        const activityLevelMap: Record<string, string> = {
          "Not very active": "sedentary",
          "Moderately active": "moderate",
          "Very active": "active"
        };
        const activityLevelApi = activityLevelMap[dailyActivityLevel] || "sedentary";

        const goalTypeMap: Record<string, string> = {
          "Lose weight": "lose",
          "Maintain weight": "maintain",
          "Gain weight": "gain"
        };
        const goalTypeApi = goalTypeMap[fitnessGoal] || "maintain";

        const response = await fetch(`${API_URL}/macros/calculate-macros`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            activity_level: activityLevelApi,
            age: calculateAge(dateOfBirth),
            dietary_preference: dietryPreference,
            dob: dobApi,
            goal_type: goalTypeApi,
            height: heightValue,
            progress_rate: progressRate,
            sex: sexApi,
            target_weight: targetWeight,
            unit_preference: unit,
            weight: weightValue
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          Alert.alert('Error', errorText);
          throw new Error('Failed to calculate macros');
        }

        const responseData = await response.json();
        console.log('Macro calculation response:', responseData);
        setMacroCalculationResponse(responseData);
        
        // Update macro targets with the response data
        setMacroTargets({
          carbs: responseData.carbs,
          fat: responseData.fat,
          protein: responseData.protein,
          calorie: responseData.calories,
        });

        // Set hasMacros to true after successful calculation
        setHasMacros(true);
        
        // Navigate to PaymentScreen
        // navigation.navigate('PaymentScreen');
        
      } catch (error) {
        Alert.alert('Error', 'Failed to calculate your macros. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate your macros. Please try again.');
    }
  }

  // Add a function to handle going to dashboard
  const handleGoToDashboard = () => {
    setReadyForDashboard(true);
  };

  const basicInfoSubsteps = [
    <GoalsGender key="gender" />,
    <GoalsDateOfBirth key="dob" />,
    // <GoalsLocation key="location" />,
    <GoalBodyMetrics key="bodymetrics" />,
    <GoalDailyActivityLevel key="activity" />,
    <GoalsDietryPreference key="diet" />,
  ];

  const yourGoalSubsteps = [
    <GoalsFitnessGoal key="fitness" />,
    <GoalsTargetWeight key="target" />,
    <GoalsProgressRate key="progress" />,
  ];

  // Macro data for GoalsPersonalizedPlan
  const macroData = macroTargets
    ? [
        { type: 'Carbs', value: macroTargets.carbs, color: '#FFC107' },
        { type: 'Fat', value: macroTargets.fat, color: '#E283E0' },
        { type: 'Protein', value: macroTargets.protein, color: '#A59DFE' },
      ]
    : [];

  const yourPlanSubsteps = [
    <GoalsPersonalizedPlan 
      isLoading={isLoading} 
      key="plan" 
      macroData={macroData} 
      calorieTarget={preferences?.calorie_target}
      macroCalculationResponse={macroCalculationResponse}
    />,
  ];

  const substepComponents = [
    basicInfoSubsteps,
    yourGoalSubsteps,
    yourPlanSubsteps,
  ];

  // Validation for current substep
  const isCurrentSubStepValid = () => {
    if (majorStep === 0 && subSteps[majorStep] === 0) {
      return !!gender;
    }
    if (majorStep === 0 && subSteps[majorStep] === 1) {
      return !!dateOfBirth;
    }
    // if (majorStep === 0 && subSteps[majorStep] === 2) {
    //   return !!location;
    // }
    if (majorStep === 0 && subSteps[majorStep] === 2) {
      if (unit === 'imperial') {
        return heightFt !== null && heightIn !== null && weightLb !== null;
      } else {
        return heightCm !== null && weightKg !== null;
      }
    }
    if (majorStep === 0 && subSteps[majorStep] === 3) {
      return !!dailyActivityLevel;
    }
    if (majorStep === 0 && subSteps[majorStep] === 4) {
      return !!dietryPreference;
    }
    if (majorStep === 1 && subSteps[majorStep] === 0) {
      return !!fitnessGoal;
    }
    if (majorStep === 1 && subSteps[majorStep] === 1) {
      return !!targetWeight;
    }
    if (majorStep === 1 && subSteps[majorStep] === 2) { 
      if (progressRate === '0.00') {
        return false;
      }
      return true;
    }
    if (majorStep === 2 && subSteps[majorStep] === 0) {
      return !!macroTargets;
    }
    // Add more validation for other substeps
    return true;
  };

  const handleContinue = async () => {
    if (!isCurrentSubStepValid()) return;

    // Check if we're on the last step of the second major step
    const isLastStepOfSecondMajor = majorStep === 2 && subSteps[majorStep] === subStepCounts[majorStep] - 1;

    if (isLastStepOfSecondMajor) {
        markSubStepComplete(majorStep, subSteps[majorStep]);
        navigation.navigate('GoalSetupScreen');
        return;
    }

    // Gender substep
    if (majorStep === 0 && subSteps[majorStep] === 0) {
      if (!gender) return;
    }

    // Date of birth substep
    if (majorStep === 0 && subSteps[majorStep] === 1) {
      if (!dateOfBirth) return;
    }

    // Location substep
    // if (majorStep === 0 && subSteps[majorStep] === 2) {
    //   if (!location) return;
    // }

    // Body metrics substep
    if (majorStep === 0 && subSteps[majorStep] === 2) {
      if (unit === 'imperial') {
        if (heightFt === null || heightIn === null || weightLb === null) return;
      } else {
        if (heightCm === null || weightKg === null) return;
      }
    }

    // If last Basic Info substep, navigate to GoalSetupScreen
    if (majorStep === 0 && subSteps[majorStep] === 3) {
      if (!dailyActivityLevel) return;
    }

    if (majorStep === 0 && subSteps[majorStep] === 4) {
      if (!dietryPreference) return;
      markSubStepComplete(majorStep, subSteps[majorStep]);
      navigation.navigate('GoalSetupScreen');
      return;
    }

    if (majorStep === 1 && subSteps[majorStep] === 0) {
      if (!fitnessGoal) return;
    }

    if (majorStep === 1 && subSteps[majorStep] === 1) {
      if (!targetWeight) return;
    }

    if (majorStep === 1 && subSteps[majorStep] === 2) {
      if (!progressRate) return;
    }

    markSubStepComplete(majorStep, subSteps[majorStep]);
    if (subSteps[majorStep] === subStepCounts[majorStep] - 1) {
      // Last substep of current major step
      navigation.navigate('GoalSetupScreen');
      return;
    }
    setSubStep(majorStep, subSteps[majorStep] + 1);
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dob: string) => {
    // Parse dob in format 'DD/MM/YYYY'
    let birthDate: Date | null = null;
    if (dob && typeof dob === 'string' && dob.includes('/')) {
      const [day, month, year] = dob.split('/').map(Number);
      birthDate = new Date(year, month - 1, day);
    } else {
      birthDate = new Date(dob);
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate progress for each major step
  const getStepProgress = (idx: number) => {
    if (idx < majorStep) return 100;
    if (idx === majorStep) return ((subSteps[majorStep] + 1) / subStepCounts[majorStep]) * 100;
    return 0;
  };

  return (
    <CustomSafeAreaView edges={['left', 'right']}>
      <View className="flex-1">
        {/* Header and Segmented Progress Bar */}
        <View className="px-4">
          <View className="flex-row items-center justify-between">
            <View style={{ width: 32 }} /> {/* Spacer to balance the row */}
          </View>
          <View className="items-center mt-2 mb-2">
            <View className="bg-aquaSqueeze rounded-full px-5 py-2 flex-row items-center justify-center mb-2">
              <Image source={IMAGE_CONSTANTS.personAltIcon} className="w-[16px] h-[16px] mr-2" />
              <Text className="text-base font-normal text-primary">{majorSteps[majorStep]}</Text>
            </View>
            {/* Segmented Progress Bar */}
            <View className="flex-row items-center justify-between space-x-2 mt-2 w-full">
              <BackButton onPress={() => navigation.goBack()} />
              <View className='ml-5 flex-row items-start justify-start gap-3 w-full'>
                {majorSteps.map((label, idx) => (
                  <View key={label}>
                    <LinearProgress
                      width={81.5}
                      height={6}
                      progress={getStepProgress(idx)}
                      color="#FEBF00"
                      backgroundColor="#E5E5E5"
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Pager */}
          <CustomPagerView
            page={subSteps[majorStep]}
            showIndicator={false}
          >
            {substepComponents[majorStep]}
          </CustomPagerView>

        {/* Continue Button */}
        <View className="absolute bottom-10 left-0 right-0">
          <TouchableOpacity
            disabled={!isCurrentSubStepValid() || isLoading}
            className={`mx-4 bg-primary ${isCurrentSubStepValid() ? 'opacity-100' : 'opacity-50'} h-[56px] rounded-[1000px] p-4 flex-row items-center justify-center gap-3`}
            onPress={handleContinue}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className='text-white text-sm font-semibold'>
                {majorStep === 2 && subSteps[majorStep] === subStepCounts[majorStep] - 1
                  ? 'Confirm'
                  : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </CustomSafeAreaView>
  );
}