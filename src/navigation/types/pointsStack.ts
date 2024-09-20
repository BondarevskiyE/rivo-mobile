export enum POINTS_SCREENS {
  POINTS_MENU_SCREEN = 'points_menu',
  LEADERBOARD_SCREEN = 'leaderboard',
  POINTS_HISTORY_SCREEN = 'points_history',
}

export type PointsStackProps = {
  [POINTS_SCREENS.POINTS_MENU_SCREEN]: undefined;
  [POINTS_SCREENS.LEADERBOARD_SCREEN]: undefined;
  [POINTS_SCREENS.POINTS_HISTORY_SCREEN]: undefined;
};
