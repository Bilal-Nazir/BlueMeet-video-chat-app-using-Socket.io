// const { Socket } = require("socket.io");

const socket= io('http://localhost:4000');

const myPeer = new Peer(undefined, {
    host: '/',
    port: '4001'
})

const peers = {}

const messagForm  = document.getElementById('send-container');
const messagContainer  = document.getElementById('message-container');
const messageInput = document.getElementById('message-input')
const Room_id = document.getElementById('ROOM_ID').value
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})
.then(stream=>{
addVideoStream(myVideo, stream)


myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

socket.on('user-connected2', userId=>{
    connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected2', userId => {
    if (peers[userId]) peers[userId].close()
  })
  
  function connectToNewUser(userId, stream) {
      const call= myPeer.call(userId, stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream=>{
          addVideoStream(video, userVideoStream)
        })
    call.on('close',()=>{
        video.remote()
    })
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

myPeer.on('open', id=>{
 socket.emit('join-room', Room_id, id)
})

//chat functionality

const Name = prompt('what is your name');

appendMessage('you joined')
socket.emit('new-user', Name)



socket.on('chat-message', data=>{
    appendMessage(`${data.name}: ${data.message}`)
});
socket.on('user-connected', name=>{
    appendMessage(`${name} connected`)
});

socket.on('user-disconnected', name=>{
    appendMessage(`${name} disconnected`)
})

messagForm.addEventListener('submit', e=>{
    e.preventDefault()
    const message = messageInput.value;
    appendMessage(`you: ${message}`)
    socket.emit('send-chat-message',message)
    messageInput.value = ''
})

function appendMessage(message) {
    
    const messageElement = document.createElement('div')
    messageElement.innerText = message;
    messagContainer.append(messageElement)
}
