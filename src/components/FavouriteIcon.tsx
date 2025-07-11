import { Image, TouchableOpacity } from "react-native";
import { IMAGE_CONSTANTS } from "../constants/imageConstants";

interface FavouriteIconProps {
    isFavourite: boolean;
    onPress: () => void;
}

export const FavouriteIcon: React.FC<FavouriteIconProps> = ({ isFavourite, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]">
            <Image source={isFavourite ? IMAGE_CONSTANTS.star : IMAGE_CONSTANTS.starIcon} className="w-6 h-6" />
        </TouchableOpacity>
    );
}