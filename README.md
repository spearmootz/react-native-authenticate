# react-native-authenticate
Authentication for Android and IOS

expanding on `naoufal/react-native-touch-id` and `jariz/react-native-fingerprint-android` comes a complete cross platform solution for both android and IOS.

This implements [the android design guidelines](https://material.google.com/patterns/fingerprint.html)

<img src="https://i.imgur.com/f5rSe6F.png" width="250">  

#### Installation
Install `naoufal/react-native-touch-id` and `jariz/react-native-fingerprint-android` separately
Just run `npm i --save react-native-authenticate` and you are set!

#### Usage

The following will be a somewhat minimal implementation considering you can have full control.  This renders a modal like view on android with the state.

```
import React, { Component } from 'react';
import Authenticate from 'react-native-authenticate';

export default SampleComponent extends Component {

  componentWillMount () {
     // Check if fingerprint auth is supported
     Authenticate.isSupported()
        .then(() => console.log('is supported))
        .catch(() => console.log('not supported))
  }

  render () {
     return (
        //whatever you want, and somewhere render <Authentication />
        <Authentication onCancel={onCancel} onFailure={} onUnsupported={} onAttempt={} />
     );
  }

}
```

#### Static Functions

#### `isSupported`
Manually cancel the authentication, this is required to follow the design principles in [the design guidelines](https://material.google.com/patterns/fingerprint.html). When called this will trigger a rejection of the original authenticate promise.

The only one you need is the isSupported. But you have access to the rest if you want to implement your UI

#### `authenticate(): Promise`
Resolves if authentication is successful, rejects otherwise.

#### `cancel(): Promise<boolean>`
Used to cancel fingerprint authentication on android

#### Props

```
{
  onAuthentication: PropTypes.func.isRequired, // On authentication success
  onFailure: PropTypes.func.isRequired, // On authentication failure
  onCancel: PropTypes.func, // On cancel (optional, if none passed then onFailure is called)
  onUnsupported: PropTypes.func,  // in the case you forgot to run the isSupported
  onAttempt: PropTypes.func, // in the case you want to be notified of android attempts
  title: PropTypes.node, // custom title, note that it needs to be a node and not a string
  secondaryText: PropTypes.node, // custom secondary line
  fingerprintState: PropTypes.node, // If you want to override the authentication state, note that it also replaces the fingerPrint icon.
  primaryColor: PropTypes.string, // sets the color for success and action buttons
  render: PropTypes.func // If you want to render your own full blown component, you get all our state, props and cancel function.
}
```
