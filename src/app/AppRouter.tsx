import {lazy, Suspense} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Home, HowToPlay, NotFound, Play, Suggest} from "@/app/pages";
import {GeneralLayout, Loading, ProtectedRoute} from "@/components/util";

const Login = lazy(() => import("@/app/pages/admin/Login").then((module) => ({default: module.Login})))
const ManageData = lazy(() => import("@/app/pages/admin/ManageData").then((module) => ({default: module.ManageData})))
const Categories = lazy(() => import("@/app/pages/admin/Categories").then((module) => ({default: module.Categories})))
const Terms = lazy(() => import("@/app/pages/admin/Terms").then((module) => ({default: module.Terms})))
const Suggestions = lazy(() => import("@/app/pages/admin/Suggestions").then((module) => ({default: module.Suggestions})))
const Logs = lazy(() => import("@/app/pages/admin/Logs").then((module) => ({default: module.Logs})))

export function AppRouter() {
    return (
        <BrowserRouter>
            <GeneralLayout>
                <Suspense fallback={<Loading text="Loading page"/>}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/play" element={<Play/>}/>
                        <Route path="/suggest" element={<Suggest/>}/>
                        <Route path="/how-to-play" element={<HowToPlay/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route element={<ProtectedRoute/>}>
                            <Route path="/manage-data" element={<ManageData/>}/>
                            <Route path="/categories" element={<Categories/>}/>
                            <Route path="/terms" element={<Terms/>}/>
                            <Route path="/suggestions" element={<Suggestions/>}/>
                            <Route path="/logs" element={<Logs/>}/>
                        </Route>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </Suspense>
            </GeneralLayout>
        </BrowserRouter>
    )
}
