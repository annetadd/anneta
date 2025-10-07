import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Library } from './library';
import ReactNativeStorage from './reactNativeStorage';

export default function LibraryDemo() {
  const [library] = React.useState(() => new Library(new ReactNativeStorage(AsyncStorage)));
  const [loaded, setLoaded] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [summary, setSummary] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      await library.load();
      setLoaded(true);
      setSummary(library.generateSummary());
    })();
  }, [library]);

  const addSampleBooks = async () => {
    try {
      library.addBook({ title: 'Dune', author: 'Frank Herbert', year: 1965, status: 'available' });
      library.addBook({ title: 'Clean Code', author: 'Robert C. Martin', year: 2008, status: 'available' });
      await library.save();
      setMessage('Added two books');
      setSummary(library.generateSummary());
    } catch (e) {
      setMessage(e.message);
    }
  };

  const borrowDune = async () => {
    try {
      library.borrowBook('Dune');
      await library.save();
      setMessage("Borrowed 'Dune'");
      setSummary(library.generateSummary());
    } catch (e) {
      setMessage(e.message);
    }
  };

  const returnDune = async () => {
    try {
      library.returnBook('Dune');
      await library.save();
      setMessage("Returned 'Dune'");
      setSummary(library.generateSummary());
    } catch (e) {
      setMessage(e.message);
    }
  };

  const searchMartin = () => {
    const results = library.searchBooks({ author: 'martin' });
    setMessage(`Found ${results.length} by author contains "martin"`);
  };

  if (!loaded) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Library Demo</Text>
      <Text>Message: {message}</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
        <Button title="Add sample books" onPress={addSampleBooks} />
        <Button title="Borrow 'Dune'" onPress={borrowDune} />
        <Button title="Return 'Dune'" onPress={returnDune} />
        <Button title="Search 'martin'" onPress={searchMartin} />
      </View>

      {summary && (
        <View>
          <Text>Total: {summary.totalBooks}</Text>
          <Text>Available: {summary.availableCount}</Text>
          <Text>Borrowed: {summary.borrowedCount}</Text>
          <Text>Authors: {summary.authors.join(', ')}</Text>
        </View>
      )}
    </ScrollView>
  );
}
