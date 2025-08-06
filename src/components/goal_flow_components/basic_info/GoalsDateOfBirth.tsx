import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

export const GoalsDateOfBirth: React.FC = () => {
  const dateOfBirth = useGoalsFlowStore((state) => state.dateOfBirth);
  const setDateOfBirth = useGoalsFlowStore((state) => state.setDateOfBirth);
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  // Calculate the maximum date as 18 years before today
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
//   const [showPicker, setShowPicker] = useState(false);


  // Date picker modal handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) setTempDate(selectedDate);
  };
  const handleDateCancel = () => {
    setShowDateModal(false);
  };
  const handleDateDone = () => {
    if (tempDate) {
      const formatted = tempDate.toLocaleDateString('en-GB');
      setDateOfBirth(formatted);
    }
    setShowDateModal(false);
  };

  return (
    <View className="flex-1 h-full">
      <Text className="text-3xl font-bold mb-8 mt-4">How old are you?</Text>
      <TouchableOpacity
        className="h-[68px] w-full border border-silver rounded-md px-4 flex-row items-center justify-between"
        onPress={() => setShowDateModal(true)}
        activeOpacity={0.8}
      >
        <Text className={`text-base ${dateOfBirth ? 'text-black' : 'text-gray-400'}`}>
          {dateOfBirth ? dateOfBirth : 'Enter your date of birth'}
        </Text>
        <Image source={IMAGE_CONSTANTS.calendarIcon} className='w-[24px] h-[24px]' />
      </TouchableOpacity>
      {Platform.OS === 'ios' ? (
      <Modal
            visible={showDateModal}
            transparent
            animationType="slide"
            onRequestClose={handleDateCancel}
          >
            <View className="flex-1 justify-end bg-black/40">
              <View className="bg-white rounded-t-xl p-4 ">
                <Text className="text-center text-base font-semibold mb-2">Select Birthday</Text>
                <DateTimePicker
                  value={tempDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={maxDate}
                  style={{ alignSelf: 'center' }}
                />
                <View className="flex-row justify-between mt-4">
                  <TouchableOpacity onPress={handleDateCancel} className="flex-1 items-center py-2">
                    <Text className="text-lg text-blue-500">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDateDone} className="flex-1 items-center py-2">
                    <Text className="text-lg text-blue-500">Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
      ) : (
        showDateModal && (
          <DateTimePicker
            value={tempDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                // On Android, immediately save the date when selected
                if (selectedDate) {
                  const formatted = selectedDate.toLocaleDateString('en-GB');
                  setDateOfBirth(formatted);
                }
                // Always close the picker on Android after any interaction
                setShowDateModal(false);
              } else {
                // On iOS, use temp state for spinner mode
                if (selectedDate) setTempDate(selectedDate);
              }
            }}
            maximumDate={maxDate}
          />
        )
      )}
    </View>
  );
};

export default GoalsDateOfBirth;
