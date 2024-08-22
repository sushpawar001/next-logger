import toast from "react-hot-toast";

const notify = (message, type) => {
    if (type === "error") {
        toast.error(message, { duration: 4000 });
    } else {
        toast.success(message, { duration: 4000 });
    }
};

export default notify;
