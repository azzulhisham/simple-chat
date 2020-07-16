const socket = io();
const $shareLocationButton = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

//message template
const messageTemplate = document.querySelector('#message-Template').innerHTML;
const locationTemplate = document.querySelector('#location-Template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-Template').innerHTML;

//option parametrers
const {username, roomname} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoScroll = () => {
    const $newMessages = $messages.lastElementChild;

    const newMessageStyle = getComputedStyle($newMessages);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessages.offsetHeight + newMessageMargin;
    
    const visibleHeight = $messages.offsetHeight;
    const contentHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(contentHeight - newMessageHeight >= scrollOffset){
        //console.log(contentHeight - newMessageHeight, scrollOffset);
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('welcomeMsg', (msg) => {
    var welcomeMsgBox = document.getElementById('welcomeMsg');
    //welcomeMsgBox.textContent = msg;
    
    const html = Mustache.render(messageTemplate, {message: msg.text, username: msg.name,
        timeStamp: msg.timeStamp});
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('shareLocationToAll', (sharelocationObj) => {
    // const mapLink = document.querySelector('#map-link');
    // mapLink.href = `https://google.com/maps?q=${sharelocationObj.latitude},${sharelocationObj.longitude}`;
    // mapLink.textContent = `Latitude: ${sharelocationObj.latitude} °, Longitude: ${sharelocationObj.longitude} °`;

    const html = Mustache.render(locationTemplate, {
        locationDisplay: 'My current location.',
        locationLink: `https://google.com/maps?q=${sharelocationObj.locationDet.latitude},${sharelocationObj.locationDet.longitude}`,
        username: sharelocationObj.name,
        timeStamp: sharelocationObj.timeStamp});
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomDet', ({roomname, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        roomname: roomname,
        users:users
    });
    $sidebar.innerHTML = html;
});

document.querySelector('#sendButton').addEventListener('click', () => {
    var messageInput = document.getElementById('messageInput');
    
    socket.emit('messageInput', messageInput.value, (error) => {
        alert(error);
    });
    messageInput.value = "";
    messageInput.focus();
});

$shareLocationButton.addEventListener('click', () => {
    $shareLocationButton.setAttribute('disabled', 'disabled');

    const status = document.querySelector('#status');
    // const mapLink = document.querySelector('#map-link');

    // mapLink.href = '';
    // mapLink.textContent = '';

    if(!navigator.geolocation) {
        status.textContent = 'Geolocation is not supported by your browser';
    } else {
        status.textContent = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error);
    }

    function success(position) {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;
    
        status.textContent = '';
        // mapLink.href = `https://google.com/maps?q=${latitude},${longitude}`;
        // mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;

        socket.emit('shareLocation', {latitude, longitude}, () => {
            alert('your location has been successfully shared!');
        });

        $shareLocationButton.removeAttribute('disabled');
      }
    
      function error() {
        status.textContent = 'Unable to retrieve your location';
        $shareLocationButton.removeAttribute('disabled');
      }    
});

socket.emit('join', {username, roomname}, (error)=> {
    if(error){
        alert(error);
        location.href = '/';
    }
});

