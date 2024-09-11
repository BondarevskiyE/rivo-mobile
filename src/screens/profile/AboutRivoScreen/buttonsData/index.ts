import {ButtonType} from '@/components/MenuActionButtons/types';
import {
  DocsUrl,
  PrivacyPolicyUrl,
  TermsOfUseUrl,
} from '@/shared/constants/links';

import {openInAppBrowser} from '@/shared/helpers/url';
import {ClosedBookIcon} from '@/shared/ui/icons/ClosedBookIcon';
import {HandIcon} from '@/shared/ui/icons/HandIcon';
import {PaperIcon} from '@/shared/ui/icons/PaperIcon';

export const aboutButtons = [
  {
    title: 'Wiki',
    type: ButtonType.IN_APP_BROWSER_LINK,
    action: () => {
      openInAppBrowser(DocsUrl);
    },
    Icon: ClosedBookIcon,
  },
  {
    title: 'Terms of Use',
    type: ButtonType.IN_APP_BROWSER_LINK,
    action: () => {
      openInAppBrowser(TermsOfUseUrl);
    },
    Icon: PaperIcon,
  },
  {
    title: 'Privacy Policy',
    type: ButtonType.IN_APP_BROWSER_LINK,
    action: () => {
      openInAppBrowser(PrivacyPolicyUrl);
    },
    Icon: HandIcon,
  },
];
