const form = document.getElementById("uploadForm");
const statusText = document.getElementById("status");

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop normal form submit

    const formData = new FormData(form);

    statusText.textContent = "Uploading and converting...";

    try {
        const response = await fetch("https://videoconvert-4.onrender.com/convert", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Conversion failed");
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = formData.get("filename") + ".mp3";

        document.body.appendChild(a);
        a.click();
        a.remove();

        statusText.textContent = "Download ready ✅";

    } catch (err) {
        console.error(err);
        statusText.textContent = "Something went wrong ❌";
    }
});
