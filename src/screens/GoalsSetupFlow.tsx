import React from 'react'
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
import { GoalsLocation } from 'src/components/goal_flow_components/basic_info/GoalsLocation'
import { GoalBodyMetrics } from 'src/components/goal_flow_components/basic_info/GoalsBodyMetrics'
import { GoalDailyActivityLevel } from 'src/components/goal_flow_components/basic_info/GoalsDailyActivityLevel'
import { GoalsDietryPreference } from 'src/components/goal_flow_components/basic_info/GoalsDietryPreference'
import { GoalsFitnessGoal } from 'src/components/goal_flow_components/your_goal/GoalsFitnessGoal'
import { GoalsTargetWeight } from 'src/components/goal_flow_components/your_goal/GoalsTargetWeight'
import { GoalsProgressRate } from 'src/components/goal_flow_components/your_goal/GoalsProgressRate'
import { GoalsPersonalizedPlan } from 'src/components/goal_flow_components/your_plan/GoalsPersonalizedPlan'

const API_URL = 'https://api.macromealsapp.com/api/v1';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
  } = useGoalsFlowStore();

  const [isLoading, setIsLoading] = React.useState(false);
  const token = useStore((state) => state.token);

  const majorSteps = ['Basic info', 'Your goal', 'Your plan'];
  const subStepCounts = [7, 3, 1];

  const basicInfoSubsteps = [
    <GoalsGender key="gender" />,
    <GoalsDateOfBirth key="dob" />,
    <GoalsLocation key="location" />,
    <GoalBodyMetrics key="bodymetrics" />,
    <GoalDailyActivityLevel key="activity" />,
    <GoalsDietryPreference key="diet" />,
  ];

  const yourGoalSubsteps = [
    <GoalsFitnessGoal key="fitness" />,
    <GoalsTargetWeight key="target" />,
    <GoalsProgressRate key="progress" />,
  ];

  const yourPlanSubsteps = [
    <GoalsPersonalizedPlan key="plan" />,
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
    if (majorStep === 0 && subSteps[majorStep] === 2) {
      return !!location;
    }
    if (majorStep === 0 && subSteps[majorStep] === 3) {
      if (unit === 'imperial') {
        return heightFt !== null && heightIn !== null && weightLb !== null;
      } else {
        return heightCm !== null && weightKg !== null;
      }
    }
    // Add more validation for other substeps
    return true;
  };

  const handleContinue = async () => {
    if (!isCurrentSubStepValid()) return;

    // Gender substep
    if (majorStep === 0 && subSteps[majorStep] === 0) {
      if (!gender) return;
      const success = await postGender(gender);
      if (!success) return;
    }

    // Date of birth substep
    if (majorStep === 0 && subSteps[majorStep] === 1) {
      if (!dateOfBirth) return;
      const success = await postDateOfBirth(dateOfBirth);
      if (!success) return;
    }

    // Location substep
    if (majorStep === 0 && subSteps[majorStep] === 2) {
      if (!location) return;
      console.log('location', location);
      const success = await postLocation(location);
      if (!success) return;
    }

    // Body metrics substep
    if (majorStep === 0 && subSteps[majorStep] === 3) {
      const success = await postBodyMetrics();
      if (!success) return;
    }

    // If last Basic Info substep, navigate to GoalSetupScreen
    if (majorStep === 0 && subSteps[majorStep] === 5) {
      if (!dailyActivityLevel) return;
      const success = await postDailyActivityLevel(dailyActivityLevel);
      if (!success) return;
      markSubStepComplete(majorStep, subSteps[majorStep]);
      navigation.navigate('GoalSetupScreen');
      return;
    }

    if (majorStep === 1 && subSteps[majorStep] === 0) {
      if (!fitnessGoal) return;
      const success = await postFitnessGoal(fitnessGoal);
      if (!success) return;
    }

    if (majorStep === 1 && subSteps[majorStep] === 1) {
      if (!targetWeight) return;
      const success = await postTargetWeight(targetWeight);
      if (!success) return;
    }

    if (majorStep === 1 && subSteps[majorStep] === 2) {
      if (!progressRate) return;
      const success = await postProgressRate(progressRate);
      if (!success) return;
    }

    markSubStepComplete(majorStep, subSteps[majorStep]);
    if (subSteps[majorStep] === subStepCounts[majorStep] - 1) {
      // Last substep of current major step
      navigation.navigate('GoalSetupScreen');
      return;
    }
    setSubStep(majorStep, subSteps[majorStep] + 1);
  };

  const postGender = async (gender: string) => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ sex: gender }),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const postDateOfBirth = async (dateOfBirth: string) => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ dob: dateOfBirth }),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const postLocation = async (location: string) => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ location }),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const postBodyMetrics = async () => {
    try {
      setIsLoading(true);
      let payload = {};
      if (unit === 'imperial') {
        payload = { heightFt, heightIn, weightLb };
      } else {
        payload = { heightCm, weightKg };
      }
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const postDailyActivityLevel = async (dailyActivityLevel: string) => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ dailyActivityLevel }),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const postDietryPreference = async (dietryPreference: string) => {            
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ dietryPreference }),
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
}

  const postFitnessGoal = async (fitnessGoal: string) => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ fitnessGoal }),
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const postTargetWeight = async (targetWeight: number) => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ targetWeight }),
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const postProgressRate = async (progressRate: string) => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ progressRate }),
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const postPersonalizedPlan = async (personalizedPlan: string) => {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/user/me`, {
        method: 'PATCH',
        body: JSON.stringify({ personalizedPlan }),
      });
      return true;
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate progress for each major step
  const getStepProgress = (idx: number) => {
    if (idx < majorStep) return 100;
    if (idx === majorStep) return ((subSteps[majorStep] + 1) / subStepCounts[majorStep]) * 100;
    return 0;
  };

  return (
    <CustomSafeAreaView edges={['left', 'right']}>
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
              <LinearProgress
                key={label}
                width={81.5}
                height={6}
                progress={getStepProgress(idx)}
                color="#FEBF00"
                backgroundColor="#E5E5E5"
              />
            ))}
            </View>
          </View>
        </View>
      </View>
      {/* Pager */}
      <CustomPagerView showIndicator={false} page={subSteps[majorStep]}>
        {substepComponents[majorStep]}
      </CustomPagerView>
      {/* Continue Button */}
      <TouchableOpacity
        disabled={!isCurrentSubStepValid() || isLoading}
        className={`mx-4 absolute bg-primary bottom-10 left-0 right-0 ${isCurrentSubStepValid() ? 'opacity-100' : 'opacity-50'} h-[56px] rounded-[1000px] p-4 flex-row items-center justify-center gap-3`}
        onPress={handleContinue}
      >
        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text className='text-white text-sm font-semibold'>Next</Text>}
      </TouchableOpacity>
    </CustomSafeAreaView>
  );
}