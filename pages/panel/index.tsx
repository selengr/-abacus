import { useEffect } from "react";
import { useState } from "react";
import UserInfo from "../../app/components/panel/userInfo";
import UserPanelLayout from "../../app/components/userPanelLayout";
import { NextPageWithLayout } from "../_app";

const Panel : NextPageWithLayout = () => {
    return (
        <div>
            <UserInfo />
        </div>
    )
}

Panel.getLayout = (page) => <UserPanelLayout>{page}</UserPanelLayout>

export default Panel;