import { configureStore } from "@reduxjs/toolkit";




const store = configureStore({
    reducer: {
        auth: require('./auth-slice').default
    }
})

export default store;