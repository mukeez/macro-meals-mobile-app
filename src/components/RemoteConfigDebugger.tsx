import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRemoteConfigContext } from '../../packages/remote_config_service/src/RemoteConfigProvider';

export const RemoteConfigDebugger: React.FC = () => {
  const { 
    getValue, 
    getAll, 
    debugLogAllValues, 
    isInitialized, 
    isLoading, 
    error,
    lastUpdate 
  } = useRemoteConfigContext();

  const [allValues, setAllValues] = React.useState<Record<string, any>>({});
  const [forceUpdateValue, setForceUpdateValue] = React.useState<string>('');

  const handleDebugLog = () => {
    console.log('[REMOTE CONFIG DEBUGGER] 🔍 Triggering debug log...');
    debugLogAllValues();
  };

  const handleGetAllValues = () => {
    try {
      const values = getAll();
      const formattedValues: Record<string, any> = {};
      
      Object.entries(values).forEach(([key, value]) => {
        formattedValues[key] = {
          stringValue: value.asString(),
          booleanValue: value.asBoolean(),
          numberValue: value.asNumber(),
          source: value.getSource()
        };
      });
      
      setAllValues(formattedValues);
      console.log('[REMOTE CONFIG DEBUGGER] 📋 Retrieved all values:', formattedValues);
    } catch (error) {
      console.error('[REMOTE CONFIG DEBUGGER] ❌ Error getting all values:', error);
    }
  };

  const handleGetForceUpdate = () => {
    try {
      const value = getValue('force_update');
      setForceUpdateValue(value.asString());
      console.log('[REMOTE CONFIG DEBUGGER] 🔧 force_update value:', {
        stringValue: value.asString(),
        booleanValue: value.asBoolean(),
        numberValue: value.asNumber(),
        source: value.getSource()
      });
    } catch (error) {
      console.error('[REMOTE CONFIG DEBUGGER] ❌ Error getting force_update:', error);
      setForceUpdateValue('Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleGetDevMode = () => {
    try {
      const value = getValue('dev_mode');
      console.log('[REMOTE CONFIG DEBUGGER] 🛠️ dev_mode value:', {
        stringValue: value.asString(),
        booleanValue: value.asBoolean(),
        numberValue: value.asNumber(),
        source: value.getSource()
      });
    } catch (error) {
      console.error('[REMOTE CONFIG DEBUGGER] ❌ Error getting dev_mode:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Remote Config Debugger</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isLoading ? '🔄 Loading...' : isInitialized ? '✅ Initialized' : '❌ Not Initialized'}
        </Text>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
        {lastUpdate && (
          <Text style={styles.updateText}>
            Last Update: {lastUpdate.updatedKeys.join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleDebugLog}>
          <Text style={styles.buttonText}>🔍 Debug Log All Values</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleGetAllValues}>
          <Text style={styles.buttonText}>📋 Get All Values</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleGetForceUpdate}>
          <Text style={styles.buttonText}>🔧 Get force_update</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleGetDevMode}>
          <Text style={styles.buttonText}>🛠️ Get dev_mode</Text>
        </TouchableOpacity>
      </View>

      {forceUpdateValue && (
        <View style={styles.valueContainer}>
          <Text style={styles.valueTitle}>force_update Value:</Text>
          <Text style={styles.valueText}>{forceUpdateValue}</Text>
        </View>
      )}

      {Object.keys(allValues).length > 0 && (
        <View style={styles.valueContainer}>
          <Text style={styles.valueTitle}>All Values ({Object.keys(allValues).length}):</Text>
          {Object.entries(allValues).map(([key, value]) => (
            <View key={key} style={styles.valueItem}>
              <Text style={styles.keyText}>{key}:</Text>
              <Text style={styles.valueText}>
                String: "{value.stringValue}" | Boolean: {value.booleanValue.toString()} | Number: {value.numberValue} | Source: {value.source}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginBottom: 4,
  },
  updateText: {
    fontSize: 14,
    color: 'blue',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  valueContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  valueItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  keyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default RemoteConfigDebugger; 