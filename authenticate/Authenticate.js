import React, { Component } from 'react';
import { Image, Text, Platform, View, StyleSheet } from 'react-native';
import Action from './Action';
import PropTypes from 'prop-types';
import fingerprint from './../utils/fingerprint';

const Style = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 0,
    height: '100%',
    width: '100%',
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,.3)',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  statusContent: {
    width: 300,
    backgroundColor: 'white',
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 16
  },
  title: {
    fontWeight: 'bold',
    paddingBottom: 20
  },
  secondaryText: {
    paddingBottom: 28,
    color: '#737373'
  },
  statusText: {
    paddingTop: 12,
    paddingBottom: 12
  },
  defaultStatus: {
    color: '#B9B9B9',
  },
  warningStatus: {
    color: '#F4511E',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  statusIcon: {
    height: 24,
    width: 24
  },
  statusIconWrapper: {
    marginRight: 16,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
    height: 40,
    width: 40,
    borderRadius: 40
  },
  actions: {
    width: 300,
    backgroundColor: 'white',
    padding: 8,
    alignItems: 'flex-end',
    marginBottom: 100
  }
});

const cancelErrors = [
  'LAErrorUserCancel',
  'LAErrorSystemCancel'
];

const ios = Platform.OS === 'ios';

export default class Authenticate extends Component {
  static isSupported = fingerprint.isSupported;
  static authenticate = fingerprint.authenticate;
  static cancel = fingerprint.cancel;

  static PropTypes = {
    onAuthentication: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    onUnsupported: PropTypes.func,
    onAttempt: PropTypes.func,
    title: PropTypes.node,
    secondaryText: PropTypes.node,
    fingerprintState: PropTypes.node,
    acceptPasscode: PropTypes.bool,
    primaryColor: PropTypes.string,
    render: PropTypes.func
  }

  static defaultProps = {
    acceptPasscode: true,
    title: null,
    secondaryText: null,
    fingerprintState: null,
    onAttempt: () => null,
    onUnsupported: () => null,
    onCancel: null,
    primaryColor: '#009688',
    render: null
  }

  state = {
    attempts: 0,
    success: false,
    canceled: false
  }

  componentDidMount () {
    Authenticate.isSupported()
      .then(() => {
        Authenticate.authenticate(this.onAttempt, this.props.acceptPasscode)
          .then(this.onAuthentication)
          .catch(this.onFailure)
      })
      .catch((err) => {
        this.props.onUnsupported();
        console.log('Fingerprint/Passcode based authentification is not supported')
      });
  }

  cancel = () => {
    this.setState({
      canceled: true
    }, () => {
      Authenticate.cancel();
    });
  }

  onCancel = (err) => {
    const { onCancel } = this.props;

    if (onCancel != null) {
      return onCancel();
    } else {
      this.setState({
        canceled: false
      }, () => {
        this.onFailure(err);
      });
    }
  }

  iosCanceled = (err) => ios && cancelErrors.some((cancelError) => cancelError == err.name || cancelError == err.message);

  onFailure = (err) => {
    const { onFailure, onCancel } = this.props;
    const canceled = this.state.canceled || this.iosCanceled(err);

    if (canceled && onCancel == null) {
      return onFailure(err);
    } else {
      return this.onCancel(err);
    }
  }

  onAttempt = () => {
    const attempts = this.state.attempts + 1;
    this.setState({
      attempts
    });

    this.props.onAttempt(attempts);
  }

  onAuthentication = () => {
    this.setState({
      success: true
    }, this.props.onAuthentication);
  }

  get fingerprintState () {
    let state;
    if (this.props.fingerprintState != null) {
      state = this.props.fingerprintState;
    } else {
      state = this.state.success ? this.successState : this.state.attempts > 0 ? this.tryAgainState : this.defaultState;
    }


    return (
      <View style={Style.statusWrapper}>
        {this.fingerprint}
        {state}
      </View>
    );
  }

  get tryAgainState () {
    return <Text style={[ Style.statusText, Style.warningStatus ]} >Try again</Text>;
  }

  get defaultState () {
    return <Text style={[ Style.statusText, Style.defaultStatus ]} >Touch Sensor</Text>;
  }

  get successState () {
    return <Text style={[Style.statusText, { color: this.props.primaryColor }]} >Success</Text>;
  }

  get canceledState () {
    return <Text style={[ Style.statusText, Style.warningStatus ]} >Canceled</Text>;
  }

  get title () {
    if (this.props.title != null) {
      return this.props.title;
    }
    return <Text style={Style.title} >Sign in</Text>;
  }

  get secondaryText () {
    if (this.props.secondaryText != null) {
      return this.props.secondaryText;
    }

    return <Text style={Style.secondaryText} >Confirm fingerprint to continue</Text>;
  }

  get fingerprint () {
    return (
      <View style={Style.statusIconWrapper}>
        <Image source={require('./fingerprint.png')} style={Style.statusIcon} />
      </View>
    );
  }

  get status () {
    return (
      <View style={Style.statusContent}>
        {this.title}
        {this.secondaryText}
        {this.fingerprintState}
      </View>
    );
  }

  get actions () {
    return (
      <View style={Style.actions}>
        <Action style={{ color: this.props.primaryColor }} title="cancel" onPress={this.cancel}/>
      </View>
    );
  }

  render () {
    if (ios) {
      return null;
    }

    if (this.props.render != null) {
      return this.props.render({ ...this.props, ...this.state, cancel: this.cancel });
    }

    return (
      <View style={Style.overlay} zIndex={999}>
        {this.status}
        {this.actions}
      </View>
    );
  }
}
