/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect, useRef} from 'react';
import type {PropsWithChildren} from 'react';
import {SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useColorScheme, View, Image, Modal} from 'react-native';

import {Colors,DebugInstructions,Header,LearnMoreLinks,ReloadInstructions} from 'react-native/Libraries/NewAppScreen';

import axios from 'axios';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import {sign, decode} from 'react-native-pure-jwt';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [nfcCardContent, setNfcCardContent] = useState("Le contenu de votre carte après scannage");
  const [showScanCardModal, setShowScanCardModal] = useState(false);

  const tokenTest = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBlc3RpYW0uY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3Mjc3NDA3OTksInJvbGUiOiJlbXBsb3llZSJ9.CzHm8hlLNQOnakPREMVwXIorMM0eUW15yxJCFICtXc";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  async function readNFCCard() {
    try {
      setShowScanCardModal(showScanCardModal => true);
      //if(!showScanCardModal) return;
      // Souscription pour la balise NFC contenant NDEF
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // l'objet tag résolu contiendra la propriété `ndefMessage`
      const tag = await NfcManager.getTag();

      if(tag){
        setNfcCardContent(nfcCardContent => Ndef.text.decodePayload(tag.ndefMessage[0].payload));
        setShowScanCardModal(showScanCardModal => false);
        console.log(nfcCardContent);

        await axios.post(`http://localhost:8000/sendToken/${nfcCardContent}`)
        .then((res) => {
          console.log("Token envoyé avec succes:", res);
        })
        .catch((err) => console.log("Erreur Axios:", err));
      }

      console.log('Tag found', tag);
    } catch (err) {
      console.log('Oula!', err);
    } finally {
      // Arreter le scan
      NfcManager.cancelTechnologyRequest();
    }
  }

  useEffect(() => {
    (async () => {
      await axios.get(`http://localhost:8000/getTokenPayload/${tokenTest}`)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    })()
  }, []);

  return (
    <SafeAreaView style={styles.background}>
      <StatusBar barStyle={'dark-content'} backgroundColor={Colors.white}/>
        <View style={styles.container}>
          <Image style={styles.nfcImage} source={require("./assets/icone_nfc1.png")}/>
          <Text style={styles.nfcContent}>{nfcCardContent}</Text>
          <TouchableOpacity style={styles.scanCardButton} onPress={readNFCCard}>
            <Text style={{color:Colors.white, fontSize:18, fontWeight:'bold'}}>Scanner</Text>
          </TouchableOpacity>
        </View>

        <Modal style={styles.modal} visible={showScanCardModal} transparent={true} animationType="fade" onRequestClose={() => setShowScanCardModal(showScanCardModal => false)}>
         <View style={styles.modalContainer} onPress={() => {NfcManager.cancelTechnologyRequest(); setShowScanCardModal(showScanCardModal => false)}}>
          <View style={styles.modalBottomSheetView}>
            <Text style={{color:'rgba(0,0,0,0.4)', fontWeight:'bold', fontSize:22}}>{"Prêt pour la lecture NFC"}</Text>
            <Image style={{width:100, height:100}} source={require("./assets/icone_mobile.png")}/>
            <Text style={{color: 'rgba(0,0,0,0.6)', fontWeight:'bold', fontSize:16, textAlign:'center'}}>{"Pour scanner votre badge, tag ou carte NFC, placez-le sur le lecteur NFC situé à l'arrière de votre téléphone."}</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {NfcManager.cancelTechnologyRequest(); setShowScanCardModal(showScanCardModal => false)}}>
              <Text style={{color:'gray', fontSize:18, fontWeight:'bold'}}>Annuler</Text>
            </TouchableOpacity>
          </View>
         </View>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  background:{
    display:'flex',
    flex:1,
    width:'100%',
    backgroundColor: Colors.white
  },

  container:{
   display:'flex',
   flex:1,
   width:'100%',
   justifyContent:'space-between',
   alignItems:'center',
   backgroundColor: Colors.white,
   paddingHorizontal:30,
   paddingVertical:100
 },

 modal:{
  display:'flex',
  flex:1,
  width:'100%'
 },

 modalContainer:{
  display:'flex',
  flex:1,
  width:'100%',
  justifyContent:'flex-end',
  alignItems:'center',
  backgroundColor: 'rgba(0,0,0,0.2)',
 },

 modalBottomSheetView:{
   display:'flex',
   height:'45%',
   width:'100%',
   justifyContent:'space-between',
   alignItems:'center',
   backgroundColor: Colors.white,
   borderTopLeftRadius: 15,
   borderTopRightRadius: 15,
   paddingVertical:20,
   paddingHorizontal:20
 },

  nfcImage:{
   width:200,
   height:200,
   tintColor:Colors.black
  },

  nfcContent:{
   color: Colors.black
 },

  scanCardButton:{
    width: '100%',
    height:50,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: Colors.black
  },

  cancelButton:{
    width: '100%',
    height:50,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: 'lightgray'
  }
});

export default App;
