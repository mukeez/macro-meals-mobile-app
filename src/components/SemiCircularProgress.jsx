import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const SemiCircularProgress = ({
  size = 200,
  color = '#009688',
  backgroundColor = '#E0E0E0',
  percent = 0.98, // 0 to 1
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Create a full semicircle path
  const startAngle = -180; // Start from top left
  const endAngle = 0; // End at top right
  const progressAngle = startAngle + (endAngle - startAngle) * percent;
  
  // Convert angles to radians
  const startRad = (startAngle * Math.PI) / 180;
  const progressRad = (progressAngle * Math.PI) / 180;
  
  // Calculate start and end points
  const startX = centerX + radius * Math.cos(startRad);
  const startY = centerY + radius * Math.sin(startRad);
  const endX = centerX + radius * Math.cos(progressRad);
  const endY = centerY + radius * Math.sin(progressRad);
  
  // Create the arc path
  const largeArcFlag = Math.abs(progressAngle - startAngle) > 180 ? 1 : 0;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  return (
    <View style={{ width: size, height: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size / 2} style={{ position: 'absolute' }}>
        {/* Background semicircle */}
        <Path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          style={{ opacity: 0.3 }}
        />
        
        {/* Progress semicircle */}
        <Path
          d={arcPath}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
      </Svg>
      
      {/* White background to create the arc effect */}
      <View style={{
        width: size - strokeWidth * 2,
        height: (size - strokeWidth * 2) / 2,
        backgroundColor: 'white',
        borderTopLeftRadius: (size - strokeWidth * 2) / 2,
        borderTopRightRadius: (size - strokeWidth * 2) / 2,
        position: 'absolute',
        top: strokeWidth,
      }} />
    </View>
  );
};

export default SemiCircularProgress; 