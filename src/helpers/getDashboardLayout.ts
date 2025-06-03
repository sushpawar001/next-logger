import axios from "axios";

export const getDashboardLayout = async () => {
    let layout = localStorage.getItem("layoutSettings");
    console.log("layout", layout);
    if (layout == null) {
        const response = await axios.get("/api/users/get-layout");
        layout = response.data.data;
        setDashboardLayoutLocal(layout);
    }

    return layout;
};


export const setDashboardLayoutLocal = async (layout: string) => {
    localStorage.setItem("layoutSettings", layout);
};
