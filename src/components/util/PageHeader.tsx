import {IconButton} from "@chakra-ui/react";
import type {ReactNode} from "react";
import {LuChevronLeft} from "react-icons/lu";
import {Link as RouterLink} from "react-router-dom";
import {TopBar} from "./TopBar";

interface PageHeaderProps {
    title: string
    backTo?: string
    end?: ReactNode
}

export function PageHeader({title, backTo, end}: PageHeaderProps) {
    const backButton = backTo ? (
        <IconButton asChild variant="ghost" aria-label="Back">
            <RouterLink to={backTo}>
                <LuChevronLeft/>
            </RouterLink>
        </IconButton>
    ) : null

    return <TopBar title={title} start={backButton} end={end}/>
}
