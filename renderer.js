const myNotification = new Notification("Title", {
    body: "notification from renderer"
});

myNotification.onclick = () => {
    console.log("notification clicked");
}