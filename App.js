import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const WORKING_KEY = "@working";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editKey, setEditKey] = useState("");
  const [edit, setEdit] = useState("");
  useEffect(() => {
    loadToDos();
    loadWorking();
    setEdit("");
    setEditKey("");
  }, []);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const saveWorking = async (working) => {
    await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(working));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setLoading(false);
    if (s) {
      setToDos(JSON.parse(s));
    }
  };
  const loadWorking = async () => {
    const sWorking = await AsyncStorage.getItem(WORKING_KEY);
    setWorking(JSON.parse(sWorking));
  };
  const addToDo = () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done: false },
    };
    setToDos(newToDos);
    saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do?", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const checkToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].done = newToDos[key].done ? false : true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  const editToDo = () => {
    if (edit === "") {
      setEditKey("");
      setEdit("");
      return;
    }
    const newToDos = { ...toDos };
    newToDos[editKey].text = edit;
    setToDos(newToDos);
    saveToDos(newToDos);
    setEditKey("");
    setEdit("");
  };
  const editText = (payload) => setEdit(payload);
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            work();
            saveWorking(true);
          }}
        >
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: working ? "white" : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            travel();
            saveWorking(false);
          }}
        >
          <Text
            style={{
              fontSize: 38,
              fontWeight: "600",
              color: working ? theme.gray : "white",
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator
          color="white"
          size="large"
          style={{ marginTop: 200 }}
        />
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                {editKey !== key ? (
                  <Text
                    style={
                      !toDos[key].done
                        ? styles.toDoText
                        : {
                            ...styles.toDoText,
                            color: theme.gray,
                            textDecorationLine: "line-through",
                          }
                    }
                  >
                    {toDos[key].text}
                  </Text>
                ) : (
                  <TextInput
                    autoFocus
                    onSubmitEditing={editToDo}
                    onChangeText={editText}
                    returnKeyType="done"
                    value={edit}
                    style={styles.editBox}
                  />
                )}
                <View style={styles.iconBox}>
                  <TouchableOpacity
                    hitSlop={{ top: 20, bottom: 20, left: 20 }}
                    onPress={() => {
                      setEditKey(key);
                      setEdit(toDos[key].text);
                    }}
                  >
                    <Fontisto name="file-1" size={24} color={theme.gray} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    hitSlop={{ top: 20, bottom: 20 }}
                    onPress={() => checkToDo(key)}
                  >
                    {toDos[key].done ? (
                      <Fontisto
                        name="checkbox-active"
                        size={24}
                        color={theme.gray}
                      />
                    ) : (
                      <Fontisto
                        name="checkbox-passive"
                        size={24}
                        color={theme.gray}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    hitSlop={{ top: 20, bottom: 20, right: 20 }}
                    onPress={() => deleteToDo(key)}
                  >
                    <Fontisto name="trash" size={18} color={theme.gray} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    flex: 1,
    marginRight: 20,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  iconBox: {
    width: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editBox: {
    flex: 1,
    marginRight: 20,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
});
