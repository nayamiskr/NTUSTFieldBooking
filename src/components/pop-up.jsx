import Swal from "sweetalert2";

export const errorPopup = (title, errorMessage) => {
    Swal.fire({
        icon: "error",
        title: title,
        text: errorMessage,
        width: "400px",
        customClass: {
            title: 'text-lg',
            htmlContainer: 'text-sm',
        },
    });
}

export const successPopup = (title, message) => {
    Swal.fire({
        icon: "success",
        title: title,
        text: message,
        width: "400px",
        customClass: {
            title: 'text-lg',
            htmlContainer: 'text-sm',
        },
    });
}