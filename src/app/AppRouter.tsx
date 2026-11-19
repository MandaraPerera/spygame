import {BrowserRouter, Route, Routes} from "react-router-dom";
import {
    Categories,
    Home,
    HowToPlay,
    Login,
    Logs,
    ManageData,
    NotFound,
    Play,
    Suggest,
    Suggestions,
    Terms
} from "@/app/pages";
import {GeneralLayout} from "@/components/util";

export function AppRouter() {
    return (
        <BrowserRouter>
            <GeneralLayout>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/play" element={<Play/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/suggest" element={<Suggest/>}/>
                    <Route path="/how-to-play" element={<HowToPlay/>}/>
                    <Route path="/manage-data" element={<ManageData/>}/>
                    <Route path="/categories" element={<Categories/>}/>
                    <Route path="/terms" element={<Terms/>}/>
                    <Route path="/suggestions" element={<Suggestions/>}/>
                    <Route path="/logs" element={<Logs/>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </GeneralLayout>
        </BrowserRouter>
    )
}
