import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const notify = (message, type) => {
  const optionsOk = {
    position: "bottom-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    progressStyle: { background: "#17A2B9" },
    theme: "dark",
  };
  const optionsErr = {
    position: "bottom-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };
  if (type === "error") {
    toast.error(message, optionsErr);
  } else {
    toast(message, optionsOk);
  }
};

export default notify;
