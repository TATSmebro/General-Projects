import { UserCredentialsProvider } from "./UserCredentialsContext";

const AppProviders = ({ userID, children }) => {
    return (
        <UserCredentialsProvider credentialsID={userID}>
            {children}
        </UserCredentialsProvider>
    );
};

export default AppProviders;