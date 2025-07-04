import {Colors, Fonts, Images} from '@/shared/ui';
import  {View, Text} from 'react-native';

interface GetIndexManagmentAccordeonItemsParams {
  mechanics: string;
  maintance: string;
  rewards: string;
}

export const getIndexManagmentAccordeonItems = ({
  mechanics,
  maintance,
  rewards,
}: GetIndexManagmentAccordeonItemsParams) => [
  {
    image: Images.services,
    title: 'Mechanics',
    content: (
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 16,
          color: Colors.ui_grey_70,
        }}>
        {mechanics}
      </Text>
    ),
  },
  {
    image: Images.heart,
    title: 'Maintaining the index',
    content: (
      <View>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 16,
            color: Colors.ui_grey_70,
          }}>
          {maintance}
        </Text>
      </View>
    ),
  },
  {
    image: Images.stars,
    title: 'Reward distribution',
    content: (
      <View>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 16,
            color: Colors.ui_grey_70,
          }}>
          {rewards}
        </Text>
      </View>
    ),
  },
];

interface GetRiskScoringAccordeonItemsParams {
  smart_ctr_sec_score: number;
  smart_ctr_sec_text: string;
  user_metrics_score: number;
  user_metrics_text: string;
  complexity_score: number;
  complexity_text: string;
  quality_underlying_asset_score: number;
  quality_underlying_asset_text: string;
}

export const getRiskScoringAccordeonItems = ({
  smart_ctr_sec_score,
  smart_ctr_sec_text,
  user_metrics_score,
  user_metrics_text,
  complexity_score,
  complexity_text,
  quality_underlying_asset_score,
  quality_underlying_asset_text,
}: GetRiskScoringAccordeonItemsParams) => [
  {
    image: Images.checkShield,
    title: 'Smart contract security',
    AdditionalTitleComponent: (
      <View
        style={{
          borderRadius: 14,
          width: 28,
          height: 28,
          backgroundColor: Colors.ui_green_70,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 14,
            color: Colors.ui_white,
          }}>
          {smart_ctr_sec_score}
        </Text>
      </View>
    ),
    content: (
      <View>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 16,
            color: Colors.ui_grey_70,
          }}>
          {smart_ctr_sec_text}
        </Text>
      </View>
    ),
  },
  {
    image: Images.userDialog,
    title: 'User metrics',
    AdditionalTitleComponent: (
      <View
        style={{
          borderRadius: 14,
          width: 28,
          height: 28,
          backgroundColor: Colors.ui_green_70,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 14,
            color: Colors.ui_white,
          }}>
          {user_metrics_score}
        </Text>
      </View>
    ),
    content: (
      <View>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 16,
            color: Colors.ui_grey_70,
          }}>
          {user_metrics_text}
        </Text>
      </View>
    ),
  },
  {
    image: Images.star,
    title: 'Complexity',
    AdditionalTitleComponent: (
      <View
        style={{
          borderRadius: 14,
          width: 28,
          height: 28,
          backgroundColor: Colors.ui_green_70,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 14,
            color: Colors.ui_white,
          }}>
          {complexity_score}
        </Text>
      </View>
    ),
    content: (
      <View>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 16,
            color: Colors.ui_grey_70,
          }}>
          {complexity_text}
        </Text>
      </View>
    ),
  },
  {
    image: Images.brilliant,
    title: 'Quality of underlying assets',
    AdditionalTitleComponent: (
      <View
        style={{
          borderRadius: 14,
          width: 28,
          height: 28,
          backgroundColor: Colors.ui_green_70,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 14,
            color: Colors.ui_white,
          }}>
          {quality_underlying_asset_score}
        </Text>
      </View>
    ),
    content: (
      <View>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 16,
            color: Colors.ui_grey_70,
          }}>
          {quality_underlying_asset_text}
        </Text>
      </View>
    ),
  },
];
