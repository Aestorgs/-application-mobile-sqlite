import { StatusBar } from "expo-status-bar";
import React from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import * as SQlite from "expo-sqlite";

//utilisation de sqlite dans une application mobile 

export default function App() {
  const db = SQlite.openDatabase("database.db");

  const [input, setInput] = React.useState("");
  const [names, setNames] = React.useState([]);

  React.useEffect(() => {
    db.transaction((tx) =>
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS person (name VARCHAR(100) NOT NULL)"
      )
    );

    db.transaction((tx) =>
      tx.executeSql(
        "SELECT rowid, * FROM person",
        null,
        (obj, res) => {
          console.log(res);
          setNames(res.rows._array);
        },
        (obj, err) => console.error(err)
      )
    );
  }, []);

  const handleAdd = () => {
    db.transaction((tx) =>
      tx.executeSql(
        "INSERT INTO person (name) VALUES (?)",
        [input],
        (obj, res) => {
          console.log(res);
          setNames((prev) => [...prev, { name: input, rowid: res.insertId }]);
        },
        (obj, err) => console.error(err)
      )
    );
    setInput("");
  };

  const handleRemove = (id) => {
    db.transaction((tx) =>
      tx.executeSql(
        "DELETE FROM person where rowid = ?",
        [id],
        (obj, res) => {
          console.log(res);
          setNames((prev) => prev.filter((item) => item.rowid !== id));
        },
        (obj, err) => console.error(err)
      )
    );
  };

  const handleUpdate = (id) => {
    db.transaction((tx) =>
      tx.executeSql(
        "UPDATE person set name = ? where rowid = ?",
        [id, input],
        (obj, res) => {
          console.log(res);
          setNames((prev) => prev.map((item) => item.rowid === id ? {...item , name : input} : item))
        },
        (obj, err) => console.error(err)
      )
    );
  };

  const showNames = () => {
    return names.map((n, i) => (
      <View
        key={i}
        style={{
          flexDirection: "row",
          width: "80%",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 24, padding: 8 }}>{n.name}</Text>
        <Button title="-" onPress={() => handleRemove(n.rowid)} />
        <Button title="/" onPress={() => handleUpdate(n.rowid)} />
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          width: "80%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 5,
          padding: 3,
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="insert name"
        />
        <Button title="+" onPress={handleAdd} />
      </View>
      <View style={styles.container}>{showNames()}</View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
