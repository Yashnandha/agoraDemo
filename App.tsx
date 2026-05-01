import React, { useState } from 'react';
import {
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { PromptBridge } = NativeModules;

const App = () => {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    try {
      const payload = {
        title: 'User Profile',
        description: 'Generate structured user data with this prompt',
        fields: ['name', 'age', 'email', 'Password', 'Confirm Password'], // dynamic from UI later
      };

      const prompt = await PromptBridge.generatePrompt(payload);

      setPrompt(prompt);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>AI Prompt Generator</Text>
      <Text style={styles.subtitle}>
        Generate structured prompts from native data
      </Text>

      {/* Action Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Generate Prompt</Text>

        <Pressable style={styles.button} onPress={handleGenerate}>
          <Text style={styles.buttonText}>Create Prompt</Text>
        </Pressable>
      </View>

      {/* Output Card */}
      <View style={styles.outputCard}>
        <Text style={styles.outputTitle}>Generated Output</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.outputText}>
            {prompt || 'Your generated AI prompt will appear here...'}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default App;

//
// 🔹 Prompt Builder
//
const buildPrompt = (data: any) => {
  const { title, description, fields } = data;

  const fieldList = fields
    .map((item: string, index: number) => {
      return `${index + 1}. ${capitalize(item)}`;
    })
    .join('\n');

  return `
You are an AI assistant.

Task:
Generate structured output.

Title:
${title}

Description:
${description}

Fields:
${fieldList}

Rules:
- Return JSON
- Clean format
- No extra explanation
`.trim();
};

//
// 🔹 Helper
//
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

//
// 🔹 Styles
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A', // dark modern background
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 12,
  },

  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  outputCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },

  outputTitle: {
    color: '#E2E8F0',
    fontSize: 16,
    marginBottom: 10,
  },

  outputText: {
    color: '#CBD5F5',
    fontSize: 13,
    lineHeight: 20,
  },
});
