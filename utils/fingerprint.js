import IOSTouchID from 'react-native-touch-id';
import androidTouchID from 'react-native-fingerprint-android';
import { Platform } from 'react-native';
// import PasscodeAuth from 'react-native-passcode-auth';

const passcodeErrors = [
  'LAErrorUserFallback',
  'LAErrorTouchIDNotAvailable',
  'LAErrorTouchIDNotEnrolled',
  'RCTTouchIDNotSupported'
];

const shouldSwitchToPasscode = (err) => false; //passcodeErrors.some(passcodeError => passcodeError === err.name);

const touchIDAndroidDriver = {
  isSupported: async () => {
    const hardware = await androidTouchID.isHardwareDetected();
    const permission = await androidTouchID.hasPermission();
    const enrolled = await androidTouchID.hasEnrolledFingerprints();

    if (!hardware || !permission || !enrolled) {
      const message = !enrolled ? 'No fingerprints registered.' : !hardware ? 'This device doesn\'t support fingerprint scanning.' : 'App has no permission.'
      return Promise.reject(message);
    }
  },
  authenticate: androidTouchID.authenticate,
  cancel: androidTouchID.cancelAuthentication
}



const touchIDIOSDriver = {
  isTouchIDSupported: async () => {
    try {
      await IOSTouchID.isSupported();
      return true;
    } catch (err) {
      return false;
    }
  },
  isPasscodeDSupported: async () => {
    return false; //hard coded
    try {
      await PasscodeAuth.isSupported();
      return true;
    } catch (err) {
      return false;
    }
  },
  isSupported: async () => {
    const touchIDSupported = await touchIDIOSDriver.isTouchIDSupported();
    const passcodeSupported = await touchIDIOSDriver.isPasscodeDSupported();
    if ((touchIDSupported || passcodeSupported) !== true) {
      return Promise.reject();
    }
  },
  authenticate: (onAttempt, acceptPasscode) => {
    return IOSTouchID.authenticate()
      .catch((err) => {
        if (acceptPasscode && shouldSwitchToPasscode(err)) {
          return PasscodeAuth.authenticate();
        }
        return Promise.reject(err);
      });
  },
  cancel: () => console.log('IOS does not have a cancel function')
}


export default Platform.OS === 'ios' ? touchIDIOSDriver : touchIDAndroidDriver;
