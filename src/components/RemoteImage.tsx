import React, { useState } from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';

interface RemoteImageProps {
  uri: string;
  fallbackSource?: ImageSourcePropType;
  className?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const RemoteImage: React.FC<RemoteImageProps> = ({
  uri,
  fallbackSource = IMAGE_CONSTANTS.mealIcon,
  className = "w-[90px] h-[90px] object-cover rounded-lg mr-2",
  resizeMode = 'cover',
  onLoad,
  onError
}) => {
  const [hasError, setHasError] = useState(false);
  const [currentUri, setCurrentUri] = useState(uri);

  const handleError = (error: any) => {
    console.log('RemoteImage error for URI:', uri, error);
    setHasError(true);
    onError?.(error);
  };

  const handleLoad = () => {
    console.log('RemoteImage loaded successfully:', uri);
    onLoad?.();
  };

  // If we've had an error, show fallback
  if (hasError) {
    return (
      <Image
        source={fallbackSource}
        className={className}
        resizeMode={resizeMode}
      />
    );
  }

  return (
    <Image
      source={{
        uri: currentUri,
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'MacroMeals/1.0'
        },
        cache: 'force-cache'
      }}
      className={className}
      resizeMode={resizeMode}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}; 