import React, {Component} from 'react';
import { StatusBar, StyleSheet, Image, Text, View, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import { Camera} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import KeepAwake from 'expo-keep-awake';
import { captureRef as takeSnapshotAsync } from 'react-native-view-shot';
//import { takeSnapshotAsync } from 'expo';
import * as Permissions from 'expo-permissions';
import group from '../assets/images/icon.png'
import logo from '../assets/logo.png'

const {height, width} = Dimensions.get('window')
const boxHeight = height / 6
const boxWidth = width / 6

const frontCamera = Camera.Constants.Type.front
const backCamera = Camera.Constants.Type.back


export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    image: null,
    count: null,
    ready: true,
    camera: frontCamera,
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ 
      camera: this.state.camera, // HACK: sometimes the camera doesn't set the right camera type
      hasCameraPermission: status === 'granted',
    });
  }

  _countDown = () => {


    if (this.state.count && this.state.count > 1) {
      this.setState({ count: this.state.count - 1 })
      return
    }
    clearInterval(this._countdown)
    this._countdown = null

    this.setState({ count: null, capturing: true })

    this._capturePhoto()
  }


  _handlePressStart = () => {
    // init counter
    this.setState({ ready: false, count: 5})
    // start interval to count down
    this._countdown = setInterval(() => {this._countDown()}, 1000)
  }

  _capturePhoto = async () => {
    // take photo
    let image = await this._camera.takePictureAsync()

    // set the preview image
    this.setState({ capturing: false })

    // delay the caputure a few seconds to make sure it's rendered
    // then save image to camera roll and close preview
    setTimeout(async () => {
      // capture photo with image overlay
      //let result = await takeSnapshotAsync(this._previewRef, {format: 'png', quality: 1.0});
      // save to camera roll
      //let saveResult = await CameraRoll.saveToCameraRoll(image, 'photo');
      let saveResult = await MediaLibrary.saveToLibraryAsync(image.uri);
      // reset back to ready state (show start button and hide preview image)
      this.setState({ ready: true, image: null })
    }, 3000)
  }

  _handlePressScreen = () => {
    // If you want this to flip when you tap, uncomment here 

    //let camera = frontCamera 
    //if (this.state.camera === camera) {
    //  camera = backCamera
    //}
    //this.setState({ camera })
  }

  render() {
    if (this.state.hasCameraPermission === null || this.state.hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    
    return (
      <TouchableWithoutFeedback style={styles.flex} onPress={this._handlePressScreen}>
        <View style={[styles.flex]}>
          <StatusBar hidden />
      

          <Camera ref={ref => {this._camera = ref}} style={styles.flex} type={this.state.camera} />

          <View ref={ref => {this._previewRef = ref}} style={[styles.fillScreen, styles.transparent]}> 
            <Image source={this.state.image ? { uri: this.state.image} : null} style={[styles.fillScreen, this.state.camera === backCamera ? {} : styles.flipX]}/>
            <Image source={logo} resizeMode="contain" style={styles.logo}/>

          </View>
          {!this.state.capturing ? null : <View style={[styles.fillScreen, styles.flashBG]} />}
          <View style={[styles.fillScreen, styles.flexCenter]}>
            {this.state.ready
              ? <Button title="take photo" onPress={this._handlePressStart} />
              : <Text style={styles.counter}>{this.state.count}</Text>
            }
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const Button = ({onPress}) => (
  <TouchableOpacity onPress={onPress}>
  <View style={styles.button}>
    <Text style={styles.buttonText}>Start</Text>
  </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flipX: { transform: [{rotateY: '180deg' }] },
  flashBG: { backgroundColor: '#ffffff' },
  transparent: { backgroundColor: 'transparent' },
  logo: { position: 'absolute', top: 10, left: 10, width: boxHeight * .01, height: boxHeight * .01 },
  groupPic: { position: 'absolute', bottom: 0, right: 10, width: boxHeight * .2, height: boxHeight * .2 },
  fillScreen: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  flexCenter: { alignItems: 'center', justifyContent: 'center' },
  counter: { fontSize: 300, backgroundColor: 'transparent', color: '#ffffff' },

  button: { height: 60, width: 200, justifyContent:'center', backgroundColor: 'red', alignItems: 'center', borderColor: '#ffffff', borderWidth: 1, borderRadius: 10 },
  buttonText: { backgroundColor: 'transparent', color: '#ffffff', fontSize: 50 },
})

