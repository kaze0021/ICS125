import React, {useState} from 'react';
import { StyleSheet, Text, SafeAreaView, View, TextInput, Pressable } from 'react-native';

export default function App() {
  // user login/signup
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [access_token, setAccessToken] = useState("")

  // setting user data
  const [birthday, setBirthday] = useState("")
  const [gender, setGender] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")

  // dailies
  const [water, setWater] = useState("")
  const [sleep, setSleep] = useState("")
  const [exercise, setExercise] = useState("")

  const attempt_login = async () => {
    try {
      let response = await (await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })).json()

      if (response.accessToken) {
        setAccessToken(response.accessToken)
        alert(response.message)
      } else {
        alert("Invalid response!")
      }
    } catch (e) {
      console.log(e.response.message)
    }
  }

  const attempt_signup = async () => {
    try {
      let response = await (await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })).json()

      if (response.accessToken) {
        setAccessToken(response.accessToken)
        alert(response.message)
      } else {
        alert("Invalid response!")
      }
    } catch (e) {
      console.log(e.response.message)
    }
  }

  const attempt_set_user_data = async () => {
    try {
      let response = await (await fetch("http://localhost:3000/set_user_data", {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: access_token,
          birthday,
          gender,
          height,
          weight
        })
      })).json()

      alert(response.message)
    } catch (e) {
      console.log(e.response.message)
    }
  }

  const attempt_set_water = async () => {
    try {
      let response = await (await fetch("http://localhost:3000/update_water", {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: access_token,
          data: water
        })
      })).json()

      alert(response.message)
    } catch (e) {
      console.log(e.response.message)
    }
  }

  const attempt_set_sleep = async () => {
    try {
      let response = await (await fetch("http://localhost:3000/update_sleep", {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: access_token,
          data: sleep
        })
      })).json()

      alert(response.message)
    } catch (e) {
      console.log(e.response.message)
    }
  }

  const attempt_set_exercise = async () => {
    try {
      let response = await (await fetch("http://localhost:3000/update_exercise", {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: access_token,
          data: exercise
        })
      })).json()

      alert(response.message)
    } catch (e) {
      console.log(e.response.message)
    }
  }

  return (
    <SafeAreaView  style={styles.container}>
      <Text style={styles.header1}>MentalZots</Text>

      <SafeAreaView style={styles.box}>
        <Text style={styles.header2}>Login/Signup</Text>
        <View style={styles.loginInfo}>
          <TextInput placeholder="email" onChangeText={t => setEmail(t)} />
          <TextInput placeholder="password" secureTextEntry={true} onChangeText={t => setPassword(t)} />
        </View>

        <Pressable style={styles.button} onPress={() => attempt_login()}>
          <Text>Login</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => attempt_signup()}>
          <Text>Sign Up</Text>
        </Pressable>
      </SafeAreaView>

      <SafeAreaView style={styles.box}>
        <Text style={styles.header2}>Setup User Data</Text>
        <View style={styles.loginInfo}>
          <TextInput placeholder="birthday" onChangeText={t => setBirthday(t)} />
          <TextInput placeholder="gender" onChangeText={t => setGender(t)} />
          <TextInput placeholder="height" onChangeText={t => setHeight(t)} />
          <TextInput placeholder="weight" onChangeText={t => setWeight(t)} />
        </View>

        <Pressable style={styles.button} onPress={() => attempt_set_user_data()}>
          <Text>Submit</Text>
        </Pressable>
      </SafeAreaView>

      <SafeAreaView style={styles.box}>
        <Text style={styles.header2}>Update Dailies</Text>
        <View style={styles.loginInfo}>
          <TextInput placeholder="water intake (oz)" onChangeText={t => setWater(t)} />
          <Pressable style={styles.button} onPress={() => attempt_set_water()}>
            <Text>Set Water</Text>
          </Pressable>
          <TextInput placeholder="sleep time (hours)" onChangeText={t => setSleep(t)} />
          <Pressable style={styles.button} onPress={() => attempt_set_sleep()}>
            <Text>Set Sleep</Text>
          </Pressable>
          <TextInput placeholder="exercise time (hours)" onChangeText={t => setExercise(t)} />
          <Pressable style={styles.button} onPress={() => attempt_set_exercise()}>
            <Text>Set Exercise</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  header1: {
    fontSize: "24px",
    fontWeight: "bold"
  },
  header2: {
    fontWeight: "bold"
  },
  box: {
    marginBottom: "30px"
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: "4px",
  },
  loginInfo: {
    margin: 0,
    width: "160px",
    gap: "4px",
    marginBottom: "10px"
  },
  button: {
    backgroundColor: '#CCD3CA',
    padding: "4px",
    width: "160px",
    alignItems: "center"
  }
});
