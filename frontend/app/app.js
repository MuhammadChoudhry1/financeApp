import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './homepage';
import IncomeDocumentation from './incomeDocumentation';
import ExpenseTracking from './expensetracking';
import CreateAccount from './create_account';
import Login from './login';
import Graphs from './graphs';
import ForgotPassword from './forgot-password'; 
import ResetPassword from './reset-password'; 
import * as Linking from 'expo-linking';

const Stack = createStackNavigator();

const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Login: 'login',
            ResetPassword: 'reset-password',
            HomePage: 'home',
            CreateAccount: 'create-account',
            IncomeDocumentation: 'income',
            ExpenseTracking: 'expenses',
            Graphs: 'graphs',
        },
    },
};

const App = () => {
    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} /> {/* Ensure this is correct */}
                <Stack.Screen name="HomePage" component={HomePage} />
                <Stack.Screen name="IncomeDocumentation" component={IncomeDocumentation} />
                <Stack.Screen name="ExpenseTracking" component={ExpenseTracking} />
                <Stack.Screen name="CreateAccount" component={CreateAccount} />
                <Stack.Screen name="Graphs" component={Graphs} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} /> {/* Add ForgotPassword */}
                <Stack.Screen name="ResetPassword" component={ResetPassword} />
                </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
