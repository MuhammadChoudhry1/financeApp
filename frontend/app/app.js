import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './homepage';
import IncomeDocumentation from './incomeDocumentation';
import ExpenseTracking from './expensetracking';
import CreateAccount from './create_account';
import Login from './login';
import Graphs from './graphs';

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} /> {/* Ensure this is correct */}
                <Stack.Screen name="HomePage" component={HomePage} />
                <Stack.Screen name="IncomeDocumentation" component={IncomeDocumentation} />
                <Stack.Screen name="ExpenseTracking" component={ExpenseTracking} />
                <Stack.Screen name="CreateAccount" component={CreateAccount} />
                <Stack.Screen name="Graphs" component={Graphs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
