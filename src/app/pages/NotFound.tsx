import {useNavigate} from "react-router-dom";
import {AlertMessage, Screen} from "@/components/util";

export function NotFound() {
    const navigate = useNavigate()

    return (
        <Screen>
            <AlertMessage status="info" title="This page doesn't exist"
                          text="Check the address, or go back to the game setup."
                          action={{label: "Back to setup", onClick: () => navigate("/")}}/>
        </Screen>
    )
}
