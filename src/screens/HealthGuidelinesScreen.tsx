import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import Header from '../components/Header';
import { healthGuidelinesData, AccordionItem } from '../constants/healthGuidelines';

const HealthGuidelinesScreen = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };





  const AccordionSection = ({ item }: { item: AccordionItem }) => {
    const isExpanded = expandedSections[item.title];
    
    return (
      <View className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <TouchableOpacity
          onPress={() => toggleSection(item.title)}
          className="flex-row items-center justify-between p-4 bg-gray-50"
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-gray-800 flex-1">
            {item.title}
          </Text>
          <Text className={`text-lg text-gray-500 ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ›
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View className="p-4 bg-white">
            {item.content.map((paragraph, index) => (
              <Text key={index} className="text-sm text-gray-600 mb-3 leading-5">
                {paragraph}
              </Text>
            ))}
            
            {item.links && (
              <View className="mt-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  References:
                </Text>
                {item.links.map((link, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleLinkPress(link.url)}
                    className="mb-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm text-[#009688] underline">
                      • {link.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <CustomSafeAreaView className="flex-1">
      <Header title="Health Guidelines" />
      <ScrollView className="px-5 py-5">

        {/* References and Methodology Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            References and Methodology
          </Text>
          {healthGuidelinesData.map((item, index) => (
            <AccordionSection key={index} item={item} />
          ))}
        </View>


        {/* Disclaimer Section */}
        <View className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-gray-300">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Disclaimer
          </Text>
          <Text className="text-sm text-blue-700 mb-3 leading-5">
            The information and calculators provided in Macro Meals are for educational and self-tracking purposes only. They do not constitute medical or nutritional advice, diagnosis, or treatment.
          </Text>
          <Text className="text-sm text-blue-700 leading-5">
            Always consult a qualified healthcare professional before making changes to your diet, exercise, or medication regimen. Results may vary depending on individual health conditions and goals.
          </Text>
        </View>
        <View className='mb-5'></View>
      </ScrollView>
    </CustomSafeAreaView>
  );
};

export default HealthGuidelinesScreen;