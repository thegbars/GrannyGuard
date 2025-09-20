import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import Granny from './pages/Granny.tsx';
import Caretaker from './pages/Caretaker.tsx';
import Home from './pages/Home.tsx';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<Home />} />
            <Route path="granny" element={<Granny />} />
            <Route path="caretaker" element={<Caretaker />} />
        </Route>
    )
)

function App({routes}) {

    return (
        <>
            <RouterProvider router={router}/>
        </>
    );
}

export default App;

