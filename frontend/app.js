import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './app/Screens/homepage';
import IncomeDocumentation from './app/Screens/incomeDocumentation';
import ExpenseTracking from './app/Screens/expensetracking';
import CreateAccount from './app/create_account';
import Login from './app/login';
import Graphs from './app/Screens/graphs';
import ForgotPassword from './app/Screens/forgot-password'; 
import ResetPassword from './app/Screens/reset-password'; // Update path for ResetPassword
import * as Linking from 'expo-linking';
import IndexPage from './app/index'; // Import IndexPage
import BudgetTracking from './app/budget'; // Import BudgetTracking

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
            BudgetTracking: 'budget', // Add BudgetTracking link
            ForgotPassword: 'forgot-password', // Ensure ForgotPassword link exists
        },
    },
};

const App = () => {
    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator initialRouteName="IndexPage" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="IndexPage" component={IndexPage} /> {/* Add IndexPage */}
                <Stack.Screen name="Login" component={Login} /> {/* Ensure this is correct */}
                <Stack.Screen name="HomePage" component={HomePage} />
                <Stack.Screen name="IncomeDocumentation" component={IncomeDocumentation} />
                <Stack.Screen name="ExpenseTracking" component={ExpenseTracking} />
                <Stack.Screen name="CreateAccount" component={CreateAccount} />
                <Stack.Screen name="Graphs" component={Graphs} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} /> {/* Add ForgotPassword */}
                <Stack.Screen name="ResetPassword" component={ResetPassword} />
                <Stack.Screen name="BudgetTracking" component={BudgetTracking} /> {/* Add BudgetTracking */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;