import {Colors, Fonts, Images} from '@/shared/ui';
import React, {View, Text} from 'react-native';

export const indexManagmentItems = [
  {
    image: Images.services,
    title: 'Mechanics',
    content: (
      <View>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 16,
            color: Colors.ui_grey_70,
          }}>
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
        </Text>
      </View>
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
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
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
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
        </Text>
      </View>
    ),
  },
];

export const riskScoringAccordeonItems = [
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
          4.2
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
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
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
          4.9
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
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
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
          4.9
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
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
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
          4.9
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
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
        </Text>
      </View>
    ),
  },
];
