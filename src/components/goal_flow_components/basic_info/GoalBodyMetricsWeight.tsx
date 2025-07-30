// import React, { useEffect, useState } from 'react';
// import { View, Text, TextInput, Platform } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { useGoalsFlowStore } from '../../../store/goalsFlowStore';

// // Validation constants
// const MIN_WEIGHT_LB = 50;
// const MAX_WEIGHT_LB = 500;
// const MIN_WEIGHT_KG = 23; // ~50 lbs
// const MAX_WEIGHT_KG = 227; // ~500 lbs

// // Weight arrays for picker
// const weightsLb = Array.from({ length: MAX_WEIGHT_LB - MIN_WEIGHT_LB + 1 }, (_, i) => MIN_WEIGHT_LB + i);
// const weightsKg = Array.from({ length: MAX_WEIGHT_KG - MIN_WEIGHT_KG + 1 }, (_, i) => MIN_WEIGHT_KG + i);

// export const GoalBodyMetricsWeight = () => {
//   const {
//     weight_unit_preference, setWeightUnitPreference,
//     weightLb,
//     weightKg,
//     setWeightLb,
//     setWeightKg,
//     markSubStepComplete,
//     majorStep,
//     subSteps
//   } = useGoalsFlowStore();

//   // Local state for validation
//   const [isValid, setIsValid] = useState(false);

//   // Validate inputs whenever they change
//   useEffect(() => {
//     if (weight_unit_preference === 'imperial') {
//       setIsValid(
//         weightLb !== null && 
//         weightLb >= MIN_WEIGHT_LB && 
//         weightLb <= MAX_WEIGHT_LB
//       );
//     } else {
//       setIsValid(
//         weightKg !== null && 
//         weightKg >= MIN_WEIGHT_KG && 
//         weightKg <= MAX_WEIGHT_KG
//       );
//     }
//   }, [weight_unit_preference, weightLb, weightKg]);

//   // Mark step as complete when valid
//   useEffect(() => {
//     if (isValid) {
//       markSubStepComplete(majorStep, subSteps[majorStep]);
//     }
//   }, [isValid, majorStep, subSteps, markSubStepComplete]);

//   const handleWeightChange = (text: string, isImperial: boolean) => {
//     const num = parseInt(text);
//     if (isImperial) {
//       setWeightLb(isNaN(num) ? null : num);
//     } else {
//       setWeightKg(isNaN(num) ? null : num);
//     }
//   };

//   return (
//     <View className="flex-1 bg-white px-4">
//       <Text className="text-2xl font-bold mb-6">What's your weight?</Text>
      
//       {weight_unit_preference === 'imperial' ? (
//         <View>
//           <Text className="text-base mb-2">Pounds</Text>
//           <View className={`${Platform.OS === 'ios' ? '' : 'border-b border-gray-100'}`}>
//             <Picker
//               selectedValue={weightLb}
//               style={{ 
//                 width: '100%', 
//                 height: 60, 
//                 color: 'black',
//                 backgroundColor: 'transparent',
//                 borderWidth: Platform.OS === 'android' ? 1 : 0,
//                 borderColor: Platform.OS === 'android' ? '#6b7280' : 'transparent',
//                 borderRadius: Platform.OS === 'android' ? 4 : 0
//               }}
//               itemStyle={{ fontSize: 18, color: Platform.OS === 'android' ? 'white' : 'black' }}
//               onValueChange={setWeightLb}
//               dropdownIconColor={Platform.OS === 'android' ? '#6b7280' : undefined}
//             >
//               <Picker.Item label="Select weight" value={null} style={{color: Platform.OS === 'android' ? 'white' : 'black'}} />
//               {weightsLb.map(lb => (
//                 <Picker.Item key={lb} label={`${lb} lbs`} style={{color: Platform.OS === 'android' ? 'white' : 'black'}} value={lb} />
//               ))}
//             </Picker>
//           </View>
//         </View>
//       ) : (
//         <View>
//           <Text className="text-base mb-2">Kilograms</Text>
//           <View className={`${Platform.OS === 'ios' ? '' : 'border-b-2 border-blue-500'}`}>
//             <Picker
//               selectedValue={weightKg}
//               style={{ 
//                 width: '100%', 
//                 height: 50, 
//                 color: 'black',
//                 backgroundColor: 'transparent',
//                 borderWidth: Platform.OS === 'android' ? 1 : 0,
//                 borderColor: Platform.OS === 'android' ? '#6b7280' : 'transparent',
//                 borderRadius: Platform.OS === 'android' ? 4 : 0
//               }}
//               itemStyle={{ fontSize: 18, color: Platform.OS === 'android' ? 'white' : 'black' }}
//               onValueChange={setWeightKg}
//               dropdownIconColor={Platform.OS === 'android' ? '#6b7280' : undefined}
//             >
//               <Picker.Item label="Select weight" value={null} style={{color: Platform.OS === 'android' ? 'white' : 'black'}} />
//               {weightsKg.map(kg => (
//                 <Picker.Item key={kg} label={`${kg} kg`} style={{color: Platform.OS === 'android' ? 'white' : 'black'}} value={kg} />
//               ))}
//             </Picker>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }; 