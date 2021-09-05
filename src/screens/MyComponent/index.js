import React from 'react';
import MessageList from '../MessageList';
import MessageSender from '../MessageSender';
import PrimaryNavigation from '../PrimaryNavigation'
import SideBar from '../SideBar';
import io from 'socket.io-client';
import Immutable from 'immutable';
export default class MyComponent extends React.Component{

    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = { 
            pendingRoom: Math.floor(Math.random() * 1000 * 100),
            messages: [],
            notifications: [],
            draft: '',
            address: null,
            data: {userCount: 0},
            viewInfo: true
        };

        //variables
        this.ZentalkWorker = null
        this.originPublicKey = null;
        this.destinationPublicKey = null;
        this.currentRoom = null
        this.socket = null;

        //refs
        this.chatView = React.createRef()
        
        //functions
        this.addNotification = this.addNotification.bind(this);
    }

    async  componentDidMount(){
        this.addNotification('Welcome Zentalk-Web!');
        this.addNotification('Please Wait Zentalk Generating New Key-Pair...');
        this.ZentalkWorker = new Worker('zentalk-worker.js');
        this.originPublicKey = await this.getWebWorkerResponse('generate-keys');
        this.addNotification(
            `Keypairs Are Now Generated: ${this.getKeyShorted(this.originPublicKey)}`
        );
        this.addNotification('User see only the Public-Key');
        this.socket = io()
        this.setupSocketListeners()
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            this.addNotification('Safe Connected With Zentalk');
            this.joinRoom();
        });

        this.socket.on('disconnect', () =>
            this.addNotification('Zentalk Lost Connection')
        );
        
        this.socket.on('MESSAGE', async message => {
            if (message.recipient === this.originPublicKey) {
                message.text = await this.getWebWorkerResponse(
                    'decrypt',
                    message.text
                );
                // this.messages.push(message);
                this.setState({ messages: [...this.state.messages, message] })
            }
        });

        this.socket.on('NEW_CONNECTION', () => {
            this.addNotification('Another User Has Joined The Room');
            this.sendPublicKey();
        });

        this.socket.on('ROOM_JOINED', newRoom => {
            this.currentRoom = newRoom;
            this.addNotification(
            `User Have Joined The Zentaroom - ${this.currentRoom}`
            );
            this.sendPublicKey();
        });

        this.socket.on('PUBLIC_KEY', key => {
            this.addNotification(
            `Public Key Received - ${this.getKeyShorted(key)}`
            );
            this.destinationPublicKey = key;
            console.log(destinationPublicKey,"public key set")
        });

        this.socket.on('user disconnected', () => {
            this.notify(
            `The User is Disconnected - ${this.getKeyShorted(
                this.destinationKey
            )}`
            );
            this.destinationPublicKey = null;
        });

        this.socket.on('ROOM_FULL', () => {
            this.addNotification(
            `Cannot Join ${this.state.pendingRoom}, Zentaroom is full`
            );
            this.state.pendingRoom = Math.floor(Math.random() * 1000 * 10);
            this.joinRoom();
        });

        this.socket.on('INTRUSION_ATTEMPT', () => {
            this.addNotification(
            'Sorry Third User are attempted to join the Zentarooms'
            );
        });
    }

    joinRoom() {
        // debugger
        if (this.state.pendingRoom !== this.currentRoom && this.originPublicKey) {
            this.addNotification(`Connecting to Zentaroom - ${this.state.pendingRoom}`);
            this.setState({messages: []})
            this.destinationPublicKey = null;
            this.socket.emit('JOIN', this.state.pendingRoom);
        }
    }

    async sendMessage() {
        if (!this.state.draft || this.state.draft === '') {
            return;
        }
        let message = Immutable.Map({
            text: this.state.draft,
            recipient: this.destinationPublicKey,
            sender: this.originPublicKey
        });

        this.setState({draft: ''})
        this.addMessage(message.toObject());

        if (this.destinationPublicKey) {
            const encryptedText = await this.getWebWorkerResponse('encrypt', [
                message.get('text'),
                this.destinationPublicKey
            ]);
            const encryptedMsg = message.set('text', encryptedText);
            this.socket.emit('MESSAGE', encryptedMsg.toObject());
        }
    }

    addMessage(message) {
        // this.messages.push(message)
        this.setState({ messages: [...this.state.messages, message] })
        this.autoscroll(this.chatView);
    }

    addNotification(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.setState({ notifications: [...this.state.notifications, timestamp, message] }) //simple value
        this.autoscroll(this.chatView); //this.autoscroll(this.$refs.notificationContainer);
    }

    getWebWorkerResponse(messageType, messagePayload) {
        return new Promise((resolve) => {
            const messageId = Math.floor(Math.random() * 100000 * 10);
            this.ZentalkWorker.postMessage(
                [messageType, messageId].concat(messagePayload)
            );
            const handler = function(e) {
                if (e.data[0] === messageId) {
                    e.currentTarget.removeEventListener(e.type, handler);
                    resolve(e.data[1]);
                }
            };
            this.ZentalkWorker.addEventListener('message', handler);
        });
    }

    sendPublicKey() {
        if (this.originPublicKey) {
            this.socket.emit('PUBLIC_KEY', this.originPublicKey);
        }
    }

    getKeyShorted(key) {
        return key?.slice(400, 416, 432);
    }

    autoscroll(element) {
        this.scrollToBottom()
    }

    scrollToBottom = () => this.chatView.current.scrollIntoView({ behavior: "smooth", block: "end" })

    handleOnChange = (e) => {

        if(e.target.name == "Send Msg") {
            this.setState({ draft: e.target.value})
        }

        if(e.target.name == "Choose Room") {
            this.setState({pendingRoom: e.target.value})
        }
        
    }

    handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if(e.target.name == "Send Msg") {
                this.sendMessage()
            }

            if(e.target.name == "Choose Room") {
                this.joinRoom()
            }
        }
    }

    handleClickDown = (e) => {
        if(e.target.name == "JOIN") {
            this.joinRoom()
        }
        else {
            this.setState({viewInfo: !this.state.viewInfo})
        }
        
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
    
        var notifications = this.state.notifications != "undefined" ? this.state.notifications : [];
        var orgPkey = this.originPublicKey;
        var obj = this

        return <div id="zentalk">
            <PrimaryNavigation />
            <div className="chat-container full-width" >
                <MessageList
                    messages={this.state.messages}
                    orgPkey={orgPkey}
                    chatView={this.chatView}
                    getKeyShorted={obj.getKeyShorted}
                    scrollIntoView={this.scrollIntoView}
                />
            </div>
            <SideBar 
                viewInfo={this.state.viewInfo}
                notifications={notifications}
                destinationPublicKey={this.destinationPublicKey}
                originPublicKey={this.originPublicKey}
                pendingRoom={this.state.pendingRoom}
                getKeyShorted={this.getKeyShorted}
                handleClickDown={this.handleClickDown}
                onChange={this.handleOnChange} 
                onKeyDown={this.handleKeyDown}
            />
            <MessageSender
                draft={this.state.draft}
                name="Send Msg"
                onChange={this.handleOnChange} 
                onKeyDown={this.handleKeyDown}
            />
        </div>
    }
}
