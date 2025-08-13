import React from 'react';
import { Text, Modal, TouchableOpacity, Pressable } from 'react-native';

interface StallionPopUpProps {
    isOpen: boolean;
    onClose: () => void;
    onRestart: () => void;
}

export default function StallionPopUp(
    {
        isOpen,
        onClose,
        onRestart,
    }: StallionPopUpProps
) {
    if (!isOpen) return null;

  return (
    <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
    >
        <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onClose}>
            <Pressable className="bg-white rounded-xl p-6 min-w-[280px] shadow-lg items-center" onPress={() => {}}>
                <TouchableOpacity className="absolute top-4 right-4 p-2" onPress={onClose}>
                    <Text className="text-xl text-gray-400">×</Text>
                </TouchableOpacity>

                <Text className="text-xl font-bold text-primary mb-2 mt-2">Update Ready</Text>
                <Text className="text-base text-center text-gray-500 mb-6">
                    A new version of the app is available. Click below to restart the app to apply changes.
                </Text>

                <TouchableOpacity className="bg-primary px-6 py-3 rounded-full mt-2 w-full" onPress={onRestart}>
                    <Text className="text-white text-base font-semibold text-center">Restart</Text>
                </TouchableOpacity>
            </Pressable>
        </Pressable>
    </Modal>
  );
}