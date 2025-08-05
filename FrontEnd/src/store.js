import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./Redux/usersReduce";
import roleReducer from "./Redux/roleReduce";
import settingsReducer from "./Redux/settingsReduce";
export default configureStore({
  reducer: {
    users: usersReducer,
    role: roleReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
